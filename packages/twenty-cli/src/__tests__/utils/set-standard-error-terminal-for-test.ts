import { isDefined } from 'twenty-shared/utils';

export const setStandardErrorTerminalForTest = () => {
  const descriptors = {
    isTTY: Object.getOwnPropertyDescriptor(process.stderr, 'isTTY'),
    columns: Object.getOwnPropertyDescriptor(process.stderr, 'columns'),
  };

  Object.defineProperties(process.stderr, {
    isTTY: { value: true, configurable: true, writable: true },
    columns: { value: 80, configurable: true, writable: true },
  });

  return () => {
    for (const [property, descriptor] of Object.entries(descriptors)) {
      if (isDefined(descriptor)) {
        Object.defineProperty(process.stderr, property, descriptor);
      } else {
        Reflect.deleteProperty(process.stderr, property);
      }
    }
  };
};
