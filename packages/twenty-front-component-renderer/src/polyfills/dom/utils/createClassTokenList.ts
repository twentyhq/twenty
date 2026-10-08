import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createIndexedClassTokenList } from '@/polyfills/dom/utils/createIndexedClassTokenList';
import { normalizeItemIndex } from '@/polyfills/dom/utils/normalizeItemIndex';
import { parseClassTokenList } from '@/polyfills/dom/utils/parseClassTokenList';
import { serializeClassTokenList } from '@/polyfills/dom/utils/serializeClassTokenList';
import { toValidClassTokenOrThrow } from '@/polyfills/dom/utils/toValidClassTokenOrThrow';

class ClassTokenList implements WorkerClassTokenList {
  readonly [index: number]: string;

  private readonly element!: ElementWithAttributes;

  constructor(element: ElementWithAttributes) {
    Object.defineProperty(this, 'element', {
      value: element,
      enumerable: false,
    });
  }

  private readCurrentTokens(): string[] {
    return parseClassTokenList(this.element.getAttribute('class') ?? '');
  }

  private writeTokens(tokens: string[]): void {
    if (tokens.length === 0 && !isDefined(this.element.getAttribute('class'))) {
      return;
    }

    this.element.setAttribute('class', serializeClassTokenList(tokens));
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

    this.writeTokens(
      shouldBePresent
        ? [...currentTokens, tokenToToggle]
        : currentTokens.filter(
            (currentToken) => currentToken !== tokenToToggle,
          ),
    );

    return shouldBePresent;
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
    return this.readCurrentTokens()[normalizeItemIndex(index)] ?? null;
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
    Array.prototype.forEach.call(this, (token: string, tokenIndex: number) => {
      callback.call(thisArgument, token, tokenIndex, this);
    });
  }

  entries(): IterableIterator<[number, string]> {
    return Array.prototype.entries.call(this);
  }

  keys(): IterableIterator<number> {
    return Array.prototype.keys.call(this);
  }

  values(): IterableIterator<string> {
    return Array.prototype.values.call(this);
  }

  toString(): string {
    return this.value;
  }

  get [Symbol.toStringTag](): string {
    return 'DOMTokenList';
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.values();
  }
}

export const createClassTokenList = (
  element: ElementWithAttributes,
): WorkerClassTokenList =>
  createIndexedClassTokenList(new ClassTokenList(element));
