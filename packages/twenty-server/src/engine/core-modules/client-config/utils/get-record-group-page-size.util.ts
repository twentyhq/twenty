import { isNumber } from '@sniptt/guards';
import { DEFAULT_RECORD_GROUP_PAGE_SIZE } from 'twenty-shared/constants';

// GraphQL Int is a signed 32-bit integer
const GRAPHQL_INT_MAX_VALUE = 2_147_483_647;

// Admin panel edits bypass the class-validator decorators on ConfigVariables,
// so the value is normalized here before it is exposed on ClientConfig as Int
export const getRecordGroupPageSize = (
  configuredPageSize: number | undefined,
): number => {
  if (
    !isNumber(configuredPageSize) ||
    !Number.isInteger(configuredPageSize) ||
    configuredPageSize <= 0 ||
    configuredPageSize > GRAPHQL_INT_MAX_VALUE
  ) {
    return DEFAULT_RECORD_GROUP_PAGE_SIZE;
  }

  return configuredPageSize;
};
