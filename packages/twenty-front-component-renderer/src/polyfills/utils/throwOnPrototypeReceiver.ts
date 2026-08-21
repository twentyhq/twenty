// Reading an attribute-backed accessor off the prototype itself would
// materialize the polyfill attribute map on the prototype, where every element
// created afterwards would then share it
export const throwOnPrototypeReceiver = (
  receiver: unknown,
  prototype: object,
): void => {
  if (receiver === prototype) {
    throw new TypeError('Illegal invocation');
  }
};
