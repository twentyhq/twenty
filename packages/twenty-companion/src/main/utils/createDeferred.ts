export const createDeferred = <TData>() => {
  let resolve!: (value: TData | PromiseLike<TData>) => void;
  const promise = new Promise<TData>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
};
