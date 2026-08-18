export type WorkerClassTokenList = {
  readonly length: number;
  value: string;
  add: (...tokens: string[]) => void;
  remove: (...tokens: string[]) => void;
  toggle: (token: string, force?: boolean) => boolean;
  replace: (oldToken: string, newToken: string) => boolean;
  contains: (token: string) => boolean;
  item: (index: number) => string | null;
  supports: (token: string) => boolean;
  forEach: (
    callback: (
      token: string,
      tokenIndex: number,
      tokenList: WorkerClassTokenList,
    ) => void,
    thisArg?: unknown,
  ) => void;
  entries: () => IterableIterator<[number, string]>;
  keys: () => IterableIterator<number>;
  values: () => IterableIterator<string>;
  toString: () => string;
  [Symbol.iterator]: () => IterableIterator<string>;
};
