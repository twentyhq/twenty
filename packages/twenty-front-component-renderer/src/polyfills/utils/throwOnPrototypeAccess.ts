// Reading an attribute-backed accessor off the prototype itself would
// materialize the polyfill attribute map on the prototype, where every element
// created afterwards would then share it
export const throwOnPrototypeAccess = (
  accessedObject: unknown,
  prototype: object,
): void => {
  if (accessedObject === prototype) {
    throw new TypeError('Illegal invocation');
  }
};
