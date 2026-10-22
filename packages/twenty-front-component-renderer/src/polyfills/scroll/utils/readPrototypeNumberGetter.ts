import { isNumber } from '@sniptt/guards';

export const readPrototypeNumberGetter = ({
  prototype,
  propertyName,
}: {
  prototype: object;
  propertyName: string;
}): ((receiver: object) => number) => {
  const getter = Object.getOwnPropertyDescriptor(prototype, propertyName)?.get;

  return (receiver) => {
    const value: unknown = getter?.call(receiver);

    return isNumber(value) ? value : 0;
  };
};
