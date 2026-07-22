import { installGetElementsByClassName } from '../installGetElementsByClassName';

class FakeElement {
  childNodes: FakeElement[] = [];
  private attributes = new Map<string, string>();

  constructor(classAttribute?: string) {
    if (classAttribute !== undefined) {
      this.attributes.set('class', classAttribute);
    }
  }

  getAttribute(attributeName: string): string | null {
    return this.attributes.get(attributeName) ?? null;
  }

  append(...children: FakeElement[]): void {
    this.childNodes.push(...children);
  }
}

installGetElementsByClassName(FakeElement.prototype);

type ElementWithGetElementsByClassName = FakeElement & {
  getElementsByClassName: (
    classNames: string,
  ) => FakeElement[] & { item: (index: number) => FakeElement | null };
};

const asInstalled = (element: FakeElement) =>
  element as ElementWithGetElementsByClassName;

describe('installGetElementsByClassName', () => {
  it('should find a nested descendant by class name', () => {
    const rootElement = new FakeElement();
    const intermediate = new FakeElement('layer');
    const target = new FakeElement('recharts-cartesian-axis-tick-value');

    rootElement.append(intermediate);
    intermediate.append(target);

    const matches = asInstalled(rootElement).getElementsByClassName(
      'recharts-cartesian-axis-tick-value',
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(target);
  });

  it('should not match the element itself', () => {
    const rootElement = new FakeElement('self');

    expect(
      asInstalled(rootElement).getElementsByClassName('self'),
    ).toHaveLength(0);
  });

  it('should require every requested token', () => {
    const rootElement = new FakeElement();
    const both = new FakeElement('first second');
    const onlyFirst = new FakeElement('first');

    rootElement.append(both, onlyFirst);

    const matches =
      asInstalled(rootElement).getElementsByClassName('first second');

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(both);
  });

  it('should return matches in depth first pre-order', () => {
    const rootElement = new FakeElement();
    const firstBranch = new FakeElement('match');
    const nestedInFirstBranch = new FakeElement('match');
    const secondBranch = new FakeElement('match');

    rootElement.append(firstBranch, secondBranch);
    firstBranch.append(nestedInFirstBranch);

    const matches = asInstalled(rootElement).getElementsByClassName('match');

    expect(matches).toHaveLength(3);
    expect(matches[0]).toBe(firstBranch);
    expect(matches[1]).toBe(nestedInFirstBranch);
    expect(matches[2]).toBe(secondBranch);
  });

  it('should return an empty result for a blank query', () => {
    const rootElement = new FakeElement();
    rootElement.append(new FakeElement('anything'));

    expect(asInstalled(rootElement).getElementsByClassName('  ')).toHaveLength(
      0,
    );
  });

  it('should skip nodes without attributes', () => {
    const rootElement = new FakeElement();
    const textLikeNode = {} as FakeElement;
    const target = new FakeElement('match');

    rootElement.childNodes.push(textLikeNode, target);

    const matches = asInstalled(rootElement).getElementsByClassName('match');

    expect(matches).toHaveLength(1);
  });

  it('should expose item returning null past the end', () => {
    const rootElement = new FakeElement();
    const target = new FakeElement('match');
    rootElement.append(target);

    const matches = asInstalled(rootElement).getElementsByClassName('match');

    expect(matches.item(0)).toBe(target);
    expect(matches.item(1)).toBeNull();
  });
});
