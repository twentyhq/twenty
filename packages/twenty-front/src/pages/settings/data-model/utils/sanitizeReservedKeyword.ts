import { RESERVED_METADATA_NAME_KEYWORDS } from 'twenty-shared/metadata';
import { capitalize } from 'twenty-shared/utils';

export const sanitizeReservedKeyword = (name: string): string => {
  if (!name) return name;

  return RESERVED_METADATA_NAME_KEYWORDS.includes(name)
    ? `${name}${capitalize('custom')}`
    : name;
};
