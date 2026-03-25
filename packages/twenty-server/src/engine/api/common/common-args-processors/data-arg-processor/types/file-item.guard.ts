import { isDefined } from 'twenty-shared/utils';

import type { FileOutput } from './file-item.type';

export const isFileOutputArray = (value: unknown): value is FileOutput[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (item): item is FileOutput =>
        isDefined(item) &&
        typeof item === 'object' &&
        'fileId' in item &&
        typeof item.fileId === 'string' &&
        'label' in item &&
        typeof item.label === 'string' &&
        'extension' in item &&
        typeof item.extension === 'string',
    )
  );
};
