import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';

const SINGLE_VALUE_UUID_OPERANDS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
] as const;

export const assertFilterIdOperandsAreValidUuids = (
  filter?: Partial<ObjectRecordFilter>,
): void => {
  const idFilter = filter?.id;

  if (!isDefined(idFilter) || typeof idFilter !== 'object') {
    return;
  }

  for (const operand of SINGLE_VALUE_UUID_OPERANDS) {
    const value = idFilter[operand];

    if (isDefined(value)) {
      assertIsValidUuid(value);
    }
  }

  if (isDefined(idFilter.in)) {
    idFilter.in.forEach((id: string) => assertIsValidUuid(id));
  }
};
