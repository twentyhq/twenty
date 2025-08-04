import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const handleDuplicateKeyError = (
  error: QueryFailedError,
  context: WorkspaceQueryRunnerOptions,
) => {
  const indexNameMatch = error.message.match(/"([^"]+)"/);

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
        `Duplicate ${columnNames}. Please set a unique one.`,
        {
          userFriendlyMessage: `This ${columnNames.toLowerCase()} is already taken. Please choose a different value.`,
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
