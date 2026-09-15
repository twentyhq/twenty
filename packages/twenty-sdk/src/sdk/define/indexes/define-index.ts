import { isNonEmptyArray } from 'twenty-shared/utils';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type IndexConfig } from '@/sdk/define/indexes/index-config';

const hasTrimmedContent = (value: string | undefined | null): boolean =>
  typeof value === 'string' && value.trim().length > 0;

export const defineIndex: DefineEntity<IndexConfig> = (config) => {
  const errors: string[] = [];

  if (!hasTrimmedContent(config.universalIdentifier)) {
    errors.push('Index must have a universalIdentifier');
  }

  if (!hasTrimmedContent(config.objectUniversalIdentifier)) {
    errors.push('Index must reference an objectUniversalIdentifier');
  }

  if (!isNonEmptyArray(config.fields)) {
    errors.push('Index must have at least one field');
  } else {
    for (const indexField of config.fields) {
      if (!hasTrimmedContent(indexField.universalIdentifier)) {
        errors.push('IndexField must have a universalIdentifier');
      }
      if (!hasTrimmedContent(indexField.fieldUniversalIdentifier)) {
        errors.push('IndexField must reference a fieldUniversalIdentifier');
      }
    }

    const dedupKeys = config.fields.map(
      (entry) =>
        `${entry.fieldUniversalIdentifier}::${entry.subFieldName ?? ''}`,
    );

    if (new Set(dedupKeys).size !== dedupKeys.length) {
      errors.push('Index lists the same column twice');
    }
  }

  return createValidationResult({ config, errors });
};
