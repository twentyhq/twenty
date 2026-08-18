import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';

class FakeElement {
  private attributes = new Map<string, string>();

  getAttribute(attributeName: string): string | null {
    return this.attributes.get(attributeName) ?? null;
  }

  setAttribute(attributeName: string, attributeValue: string): void {
    this.attributes.set(attributeName, attributeValue);
  }
}

class FakeRemoteElement {
  className?: string;

  getAttribute(): string | null {
    return null;
  }

  setAttribute(attributeName: string, attributeValue: string): void {
    if (attributeName === 'class') {
      this.className = attributeValue;
    }
  }
}

const expectDomException = (callback: () => void, exceptionName: string) => {
  let thrownError: unknown = null;

  try {
    callback();
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError).toBeInstanceOf(DOMException);
  expect((thrownError as DOMException).name).toBe(exceptionName);
};

describe('createClassTokenList', () => {
  describe('add', () => {
    it('should create the class attribute when adding to an element without one', () => {
      const element = new FakeElement();
      const classTokenList = createClassTokenList(element);

      classTokenList.add('mapboxgl-map');

      expect(element.getAttribute('class')).toBe('mapboxgl-map');
    });

    it('should append tokens while preserving existing ones', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first');
      const classTokenList = createClassTokenList(element);

      classTokenList.add('second', 'third');

      expect(element.getAttribute('class')).toBe('first second third');
    });

    it('should not duplicate a token that is already present', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second');
      const classTokenList = createClassTokenList(element);

      classTokenList.add('first');

      expect(element.getAttribute('class')).toBe('first second');
    });

    it('should normalize surrounding whitespace when rewriting the attribute', () => {
      const element = new FakeElement();
      element.setAttribute('class', '  first \t second  ');
      const classTokenList = createClassTokenList(element);

      classTokenList.add('third');

      expect(element.getAttribute('class')).toBe('first second third');
    });

    it('should throw a SyntaxError for an empty token', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expectDomException(() => classTokenList.add(''), 'SyntaxError');
    });

    it('should throw an InvalidCharacterError for a token containing whitespace', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expectDomException(
        () => classTokenList.add('two tokens'),
        'InvalidCharacterError',
      );
    });

    it('should validate every token before mutating anything', () => {
      const element = new FakeElement();
      const classTokenList = createClassTokenList(element);

      expectDomException(() => classTokenList.add('valid', ''), 'SyntaxError');

      expect(element.getAttribute('class')).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove the requested tokens and keep the others', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second third');
      const classTokenList = createClassTokenList(element);

      classTokenList.remove('first', 'third');

      expect(element.getAttribute('class')).toBe('second');
    });

    it('should leave an empty attribute after removing the last token', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'only');
      const classTokenList = createClassTokenList(element);

      classTokenList.remove('only');

      expect(element.getAttribute('class')).toBe('');
    });

    it('should not create the attribute when removing from an element without one', () => {
      const element = new FakeElement();
      const classTokenList = createClassTokenList(element);

      classTokenList.remove('absent');

      expect(element.getAttribute('class')).toBeNull();
    });

    it('should throw the spec exceptions', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expectDomException(() => classTokenList.remove(''), 'SyntaxError');
      expectDomException(
        () => classTokenList.remove('a b'),
        'InvalidCharacterError',
      );
    });
  });

  describe('toggle', () => {
    it('should add an absent token and return true', () => {
      const element = new FakeElement();
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.toggle('open')).toBe(true);
      expect(element.getAttribute('class')).toBe('open');
    });

    it('should remove a present token and return false', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'open');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.toggle('open')).toBe(false);
      expect(element.getAttribute('class')).toBe('');
    });

    it('should keep a present token when forced on', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'open');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.toggle('open', true)).toBe(true);
      expect(element.getAttribute('class')).toBe('open');
    });

    it('should not add an absent token when forced off', () => {
      const element = new FakeElement();
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.toggle('open', false)).toBe(false);
      expect(element.getAttribute('class')).toBeNull();
    });

    it('should throw the spec exceptions', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expectDomException(() => classTokenList.toggle(''), 'SyntaxError');
      expectDomException(
        () => classTokenList.toggle('a b'),
        'InvalidCharacterError',
      );
    });
  });

  describe('replace', () => {
    it('should replace a token in place', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second third');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.replace('second', 'replaced')).toBe(true);
      expect(element.getAttribute('class')).toBe('first replaced third');
    });

    it('should return false without mutating when the old token is absent', () => {
      const element = new FakeElement();
      element.setAttribute('class', ' first ');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.replace('absent', 'replaced')).toBe(false);
      expect(element.getAttribute('class')).toBe(' first ');
    });

    it('should collapse duplicates of the new token like the ordered set replace', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second third');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.replace('third', 'first')).toBe(true);
      expect(element.getAttribute('class')).toBe('first second');
    });

    it('should validate both tokens', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expectDomException(
        () => classTokenList.replace('', 'new'),
        'SyntaxError',
      );
      expectDomException(
        () => classTokenList.replace('old', 'has space'),
        'InvalidCharacterError',
      );
    });
  });

  describe('contains', () => {
    it('should report token presence without throwing on invalid tokens', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'present');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.contains('present')).toBe(true);
      expect(classTokenList.contains('absent')).toBe(false);
      expect(classTokenList.contains('')).toBe(false);
      expect(classTokenList.contains('two tokens')).toBe(false);
    });
  });

  describe('item and length', () => {
    it('should expose tokens by index and count them deduplicated', () => {
      const element = new FakeElement();
      element.setAttribute('class', ' first  second first ');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.length).toBe(2);
      expect(classTokenList.item(0)).toBe('first');
      expect(classTokenList.item(1)).toBe('second');
      expect(classTokenList.item(2)).toBeNull();
    });
  });

  describe('value and toString', () => {
    it('should return the raw attribute value', () => {
      const element = new FakeElement();
      element.setAttribute('class', ' raw  value ');
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.value).toBe(' raw  value ');
      expect(classTokenList.toString()).toBe(' raw  value ');
      expect(String(classTokenList)).toBe(' raw  value ');
    });

    it('should return an empty string for an element without a class', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expect(classTokenList.value).toBe('');
      expect(classTokenList.toString()).toBe('');
    });

    it('should write the assigned value as is', () => {
      const element = new FakeElement();
      const classTokenList = createClassTokenList(element);

      classTokenList.value = ' first  second ';

      expect(element.getAttribute('class')).toBe(' first  second ');
      expect(classTokenList.length).toBe(2);
    });
  });

  describe('iteration', () => {
    it('should iterate tokens with the spread operator and for of', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second');
      const classTokenList = createClassTokenList(element);

      expect([...classTokenList]).toEqual(['first', 'second']);

      const iterated: string[] = [];

      for (const token of classTokenList) {
        iterated.push(token);
      }

      expect(iterated).toEqual(['first', 'second']);
    });

    it('should expose entries, keys and values iterators', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second');
      const classTokenList = createClassTokenList(element);

      expect([...classTokenList.entries()]).toEqual([
        [0, 'first'],
        [1, 'second'],
      ]);
      expect([...classTokenList.keys()]).toEqual([0, 1]);
      expect([...classTokenList.values()]).toEqual(['first', 'second']);
    });

    it('should call the forEach callback with token, index, list and thisArg', () => {
      const element = new FakeElement();
      element.setAttribute('class', 'first second');
      const classTokenList = createClassTokenList(element);
      const thisArg = { marker: true };
      const calls: unknown[][] = [];

      classTokenList.forEach(function (this: unknown, ...callbackArguments) {
        calls.push([this, ...callbackArguments]);
      }, thisArg);

      expect(calls).toEqual([
        [thisArg, 'first', 0, classTokenList],
        [thisArg, 'second', 1, classTokenList],
      ]);
    });
  });

  describe('supports', () => {
    it('should throw a TypeError because the class attribute has no supported tokens', () => {
      const classTokenList = createClassTokenList(new FakeElement());

      expect(() => classTokenList.supports('anything')).toThrow(TypeError);
    });
  });

  describe('className reflection on remote elements', () => {
    it('should read tokens from the className property when the attribute is absent', () => {
      const element = new FakeRemoteElement();
      element.className = 'from-react second';
      const classTokenList = createClassTokenList(element);

      expect(classTokenList.contains('from-react')).toBe(true);
      expect(classTokenList.length).toBe(2);
      expect(classTokenList.value).toBe('from-react second');
    });

    it('should preserve className tokens when writing through the redirected setAttribute', () => {
      const element = new FakeRemoteElement();
      element.className = 'from-react';
      const classTokenList = createClassTokenList(element);

      classTokenList.add('mapboxgl-map');

      expect(element.className).toBe('from-react mapboxgl-map');
    });

    it('should round trip consecutive writes through the className property', () => {
      const element = new FakeRemoteElement();
      const classTokenList = createClassTokenList(element);

      classTokenList.add('first');
      classTokenList.add('second');
      classTokenList.remove('first');

      expect(element.className).toBe('second');
    });
  });
});
