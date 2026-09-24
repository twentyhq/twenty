type PolyfillMethodImplementation<TReceiver extends object> = (
  receiver: TReceiver,
  ...methodArguments: unknown[]
) => unknown;

export const definePolyfillMethod = <TReceiver extends object>({
  target,
  methodName,
  method,
}: {
  target: object;
  methodName: string;
  method: PolyfillMethodImplementation<TReceiver>;
}): void => {
  Object.defineProperty(target, methodName, {
    value(this: TReceiver, ...methodArguments: unknown[]) {
      return method(this, ...methodArguments);
    },
    configurable: true,
    writable: true,
  });
};
