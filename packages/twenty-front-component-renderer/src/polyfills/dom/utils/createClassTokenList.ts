import { isDefined } from 'twenty-shared/utils';

import { type ClassAttributeTargetElement } from '@/polyfills/dom/types/ClassAttributeTargetElement';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { parseClassTokenList } from '@/polyfills/dom/utils/parseClassTokenList';
import { toClassTokenIndex } from '@/polyfills/dom/utils/toClassTokenIndex';
import { toValidClassTokenOrThrow } from '@/polyfills/dom/utils/toValidClassTokenOrThrow';

class ClassTokenList implements WorkerClassTokenList {
  readonly [index: number]: string;

  private readonly element: ClassAttributeTargetElement;

  constructor(element: ClassAttributeTargetElement) {
    this.element = element;
    Object.defineProperty(this, 'element', { enumerable: false });
  }

  private readCurrentTokens(): string[] {
    return parseClassTokenList(this.element.getAttribute('class') ?? '');
  }

  private writeTokens(tokens: string[]): void {
    if (tokens.length === 0 && !isDefined(this.element.getAttribute('class'))) {
      return;
    }

    this.element.setAttribute('class', [...new Set(tokens)].join(' '));
  }

  get length(): number {
    return this.readCurrentTokens().length;
  }

  get value(): string {
    return this.element.getAttribute('class') ?? '';
  }

  set value(newValue: string) {
    this.element.setAttribute('class', String(newValue));
  }

  add(...tokens: string[]): void {
    const tokensToAdd = tokens.map(toValidClassTokenOrThrow);

    this.writeTokens([...this.readCurrentTokens(), ...tokensToAdd]);
  }

  remove(...tokens: string[]): void {
    const tokensToRemove = tokens.map(toValidClassTokenOrThrow);

    this.writeTokens(
      this.readCurrentTokens().filter(
        (currentToken) => !tokensToRemove.includes(currentToken),
      ),
    );
  }

  toggle(token: string, force?: boolean): boolean {
    const tokenToToggle = toValidClassTokenOrThrow(token);

    const currentTokens = this.readCurrentTokens();
    const isPresent = currentTokens.includes(tokenToToggle);
    const shouldBePresent = force === undefined ? !isPresent : Boolean(force);

    if (shouldBePresent === isPresent) {
      return shouldBePresent;
    }

    if (shouldBePresent) {
      this.writeTokens([...currentTokens, tokenToToggle]);

      return true;
    }

    this.writeTokens(
      currentTokens.filter((currentToken) => currentToken !== tokenToToggle),
    );

    return false;
  }

  replace(oldToken: string, newToken: string): boolean {
    const oldTokenToReplace = toValidClassTokenOrThrow(oldToken);
    const newTokenToInsert = toValidClassTokenOrThrow(newToken);

    const currentTokens = this.readCurrentTokens();

    if (!currentTokens.includes(oldTokenToReplace)) {
      return false;
    }

    this.writeTokens(
      currentTokens.map((currentToken) =>
        currentToken === oldTokenToReplace ? newTokenToInsert : currentToken,
      ),
    );

    return true;
  }

  contains(token: string): boolean {
    return this.readCurrentTokens().includes(String(token));
  }

  item(index: number): string | null {
    return this.readCurrentTokens()[toClassTokenIndex(index)] ?? null;
  }

  supports(): boolean {
    throw new TypeError(
      "Failed to execute 'supports': the class attribute has no supported tokens.",
    );
  }

  forEach(
    callback: (
      token: string,
      tokenIndex: number,
      tokenList: WorkerClassTokenList,
    ) => void,
    thisArgument?: unknown,
  ): void {
    for (const [tokenIndex, token] of this.readCurrentTokens().entries()) {
      callback.call(thisArgument, token, tokenIndex, this);
    }
  }

  entries(): IterableIterator<[number, string]> {
    return this.readCurrentTokens().entries();
  }

  keys(): IterableIterator<number> {
    return this.readCurrentTokens().keys();
  }

  values(): IterableIterator<string> {
    return this.readCurrentTokens().values();
  }

  toString(): string {
    return this.value;
  }

  get [Symbol.toStringTag](): string {
    return 'DOMTokenList';
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.readCurrentTokens().values();
  }
}

const toIndexedPropertyPosition = (
  property: string | symbol,
): number | null => {
  if (typeof property !== 'string') {
    return null;
  }

  const propertyPosition = Number(property);

  if (
    !Number.isInteger(propertyPosition) ||
    propertyPosition < 0 ||
    String(propertyPosition) !== property
  ) {
    return null;
  }

  return propertyPosition;
};

export const createClassTokenList = (
  element: ClassAttributeTargetElement,
): WorkerClassTokenList =>
  new Proxy(new ClassTokenList(element), {
    get: (target, property, receiver) => {
      const propertyPosition = toIndexedPropertyPosition(property);

      if (!isDefined(propertyPosition)) {
        return Reflect.get(target, property, receiver);
      }

      return target.item(propertyPosition) ?? undefined;
    },
    has: (target, property) => {
      const propertyPosition = toIndexedPropertyPosition(property);

      if (!isDefined(propertyPosition)) {
        return Reflect.has(target, property);
      }

      return propertyPosition < target.length;
    },
    getOwnPropertyDescriptor: (target, property) => {
      const propertyPosition = toIndexedPropertyPosition(property);

      if (!isDefined(propertyPosition)) {
        return Reflect.getOwnPropertyDescriptor(target, property);
      }

      const token = target.item(propertyPosition);

      if (token === null) {
        return undefined;
      }

      return {
        value: token,
        writable: false,
        enumerable: true,
        configurable: true,
      };
    },
    ownKeys: (target) => [
      ...Array.from({ length: target.length }, (_, tokenIndex) =>
        String(tokenIndex),
      ),
      ...Reflect.ownKeys(target),
    ],
  });
