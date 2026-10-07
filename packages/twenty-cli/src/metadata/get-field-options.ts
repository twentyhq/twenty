import { isArray } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type InspectedField } from '@/metadata/types/metadata-inspection.type';

export const getFieldOptions = (field: InspectedField) => {
  const options: unknown = field.options;

  return isArray(options) ? options.filter(isPlainObject) : [];
};
