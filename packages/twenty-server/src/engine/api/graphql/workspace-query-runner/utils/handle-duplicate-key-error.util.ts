import { isDefined } from 'twenty-shared';
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

    const deletedAtFieldMetadata =
      context.objectMetadataItemWithFieldMaps.fieldsByName['deletedAt'];

    const affectedColumns =
      context.objectMetadataItemWithFieldMaps.indexMetadatas
        .find((index) => index.name === indexName)
        ?.indexFieldMetadatas?.filter(
          (field) => field.fieldMetadataId !== deletedAtFieldMetadata?.id,
        )
        .map((indexField) => {
          const fieldMetadata =
            context.objectMetadataItemWithFieldMaps.fieldsById[
              indexField.fieldMetadataId
            ];

          return fieldMetadata?.label;
        });

    if (!isDefined(affectedColumns)) {
      throw new UserInputError(`A duplicate entry was detected`);
    }

    const columnNames = affectedColumns.join(', ');

    if (affectedColumns?.length === 1) {
      throw new UserInputError(
        `Duplicate ${columnNames}. Please set a unique one.`,
      );
    }

    throw new UserInputError(
      `A duplicate entry was detected. The combination of ${columnNames} must be unique.`,
    );
  }
};
