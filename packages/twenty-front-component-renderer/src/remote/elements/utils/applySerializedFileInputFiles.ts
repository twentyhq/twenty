import { isDefined } from 'twenty-shared/utils';

import { type SerializedFileData } from '@/types/SerializedFileData';

const inputsWithFileReset = new WeakSet<object>();

export const applySerializedFileInputFiles = ({
  element,
  files,
}: {
  element: object;
  files: SerializedFileData[] | undefined;
}): void => {
  Reflect.set(
    element,
    'files',
    files?.map((fileData) => fileData.file ?? fileData),
  );

  if (
    Reflect.get(element, 'type') !== 'file' ||
    inputsWithFileReset.has(element)
  ) {
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
  inputsWithFileReset.add(element);
};
