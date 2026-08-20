import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const QUERY_READ_TIMEOUT_MESSAGE = 'Query read timeout';

export const DUPLICATE_ENTRY_DETECTED_MESSAGE =
  'A duplicate entry was detected';

export const QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE = msg`We are experiencing a temporary issue with our database. Please try again later.`;

export const DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE = msg`This record already exists. Please check your data and try again.`;

export const INVALID_INPUT_USER_FRIENDLY_MESSAGE = msg`Invalid input provided.`;

export const CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES: Record<
  string,
  MessageDescriptor
> = {
  [POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION]: msg`A required field is missing. Please provide all required values and try again.`,
  [POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION]: msg`This operation references a record that does not exist or cannot be modified due to existing relationships.`,
  [POSTGRESQL_ERROR_CODES.RESTRICT_VIOLATION]: msg`This record cannot be deleted because it is still referenced by other records.`,
};
