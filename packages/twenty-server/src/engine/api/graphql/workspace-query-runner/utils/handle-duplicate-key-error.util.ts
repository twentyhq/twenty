import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type QueryFailedError } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

interface PostgreSQLError extends QueryFailedError {
  detail?: string;
}

export const handleDuplicateKeyError = (
  error: PostgreSQLError,
  objectMetadata: ObjectMetadataItemWithFieldMaps,
) => {
  const indexNameMatch = error.message.match(/"([^"]+)"/);

  const duplicatedValues = error?.detail?.match(/=\(([^)]+)\)/)?.[1];

  if (indexNameMatch) {
    const indexName = indexNameMatch[1];

    const deletedAtFieldMetadataId = objectMetadata.fieldIdByName['deletedAt'];

    const affectedColumns = objectMetadata.indexMetadatas
      .find((index) => index.name === indexName)
      ?.indexFieldMetadatas?.filter(
        (field) => field.fieldMetadataId !== deletedAtFieldMetadataId,
      )
      .map((indexField) => {
        const fieldMetadata =
          objectMetadata.fieldsById[indexField.fieldMetadataId];

        return fieldMetadata?.label;
      });

    if (!isDefined(affectedColumns)) {
      throw new TwentyORMException(
        `A duplicate entry was detected`,
        TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
        {
          userFriendlyMessage: msg`This record already exists. Please check your data and try again.`,
        },
      );
    }

    const columnNames = affectedColumns.join(', ');

    if (affectedColumns?.length === 1) {
      throw new UserInputError(
        `Duplicate ${columnNames} ${duplicatedValues ? `with value ${duplicatedValues}` : ''}. Please set a unique one.`,
        {
          // eslint-disable-next-line lingui/no-expression-in-message
          userFriendlyMessage: msg`This ${columnNames.toLowerCase()} ${duplicatedValues ? `with value ${duplicatedValues}` : ''} is already taken. Please choose a different value.`,
          isExpected: true,
        },
      );
    }

    throw new TwentyORMException(
      `A duplicate entry was detected. The combination of ${columnNames} must be unique.`,
      TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
      {
        // eslint-disable-next-line lingui/no-expression-in-message
        userFriendlyMessage: msg`This combination of ${columnNames.toLowerCase()} already exists. Please use different values.`,
      },
    );
  }
};
