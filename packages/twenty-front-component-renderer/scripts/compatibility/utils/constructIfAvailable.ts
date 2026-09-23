import { isUndefined } from '@sniptt/guards';

export const constructIfAvailable = <TInstance, TArguments extends unknown[]>(
  instanceConstructor:
    | (new (...constructorArguments: TArguments) => TInstance)
    | undefined,
  ...constructorArguments: TArguments
): TInstance | undefined =>
  isUndefined(instanceConstructor)
    ? undefined
    : new instanceConstructor(...constructorArguments);
