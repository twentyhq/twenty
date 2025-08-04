import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

interface PostgreSQLError extends QueryFailedError {
  detail?: string;
}

export const handleDuplicateKeyError = (
  error: PostgreSQLError,
  context: WorkspaceQueryRunnerOptions,
) => {
  const indexNameMatch = error.message.match(/"([^"]+)"/);

  const duplicatedValues = error?.detail?.match(/=\(([^)]+)\)/)?.[1];

  if (indexNameMatch) {
    const indexName = indexNameMatch[1];

    const deletedAtFieldMetadataId =
      context.objectMetadataItemWithFieldMaps.fieldIdByName['deletedAt'];

    const affectedColumns =
      context.objectMetadataItemWithFieldMaps.indexMetadatas
        .find((index) => index.name === indexName)
        ?.indexFieldMetadatas?.filter(
          (field) => field.fieldMetadataId !== deletedAtFieldMetadataId,
        )
        .map((indexField) => {
          const fieldMetadata =
            context.objectMetadataItemWithFieldMaps.fieldsById[
              indexField.fieldMetadataId
            ];

          return fieldMetadata?.label;
        });

    if (!isDefined(affectedColumns)) {
      throw new UserInputError(`A duplicate entry was detected`, {
        userFriendlyMessage: `This record already exists. Please check your data and try again.`,
      });
    }

    const columnNames = affectedColumns.join(', ');

    if (affectedColumns?.length === 1) {
      throw new UserInputError(
        `Duplicate ${columnNames} ${duplicatedValues ? `with value ${duplicatedValues}` : ''}. Please set a unique one.`,
        {
          userFriendlyMessage: `This ${columnNames.toLowerCase()} ${duplicatedValues ? `with value ${duplicatedValues}` : ''} is already taken. Please choose a different value.`,
        },
      );
    }

    throw new UserInputError(
      `A duplicate entry was detected. The combination of ${columnNames} must be unique.`,
      {
        userFriendlyMessage: `This combination of ${columnNames.toLowerCase()} already exists. Please use different values.`,
      },
    );
  }
};
