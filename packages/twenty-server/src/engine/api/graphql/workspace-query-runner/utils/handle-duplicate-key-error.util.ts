import { msg } from '@lingui/core/macro';
import { type QueryFailedError } from 'typeorm';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

interface PostgreSQLError extends QueryFailedError {
  detail?: string;
}

export const handleDuplicateKeyError = (
  _error: PostgreSQLError,
  _objectMetadata: FlatObjectMetadata,
) => {
  // Since we no longer have indexMetadatas in FlatObjectMetadata,
  // we provide a generic error message
  throw new TwentyORMException(
    `A duplicate entry was detected`,
    TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
    {
      userFriendlyMessage: msg`This record already exists. Please check your data and try again.`,
    },
  );
};
