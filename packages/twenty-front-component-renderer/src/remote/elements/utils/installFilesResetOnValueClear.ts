import { isDefined } from 'twenty-shared/utils';

const inputsWithFilesReset = new WeakSet<object>();

export const installFilesResetOnValueClear = (element: object): void => {
  if (inputsWithFilesReset.has(element)) {
    return;
  }

  const valueDescriptor = Object.getOwnPropertyDescriptor(element, 'value');
  const setValue = valueDescriptor?.set;

  if (!isDefined(setValue)) {
    return;
  }

  Object.defineProperty(element, 'value', {
    ...valueDescriptor,
    set: (value: unknown) => {
      setValue.call(element, value);
      if (value === '') {
        Reflect.set(element, 'files', []);
      }
    },
  });
  inputsWithFilesReset.add(element);
};
