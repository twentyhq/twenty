import { QueryFailedError } from 'typeorm';

import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TimeoutError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const workspaceQueryRunnerGraphqlApiExceptionHandler = (
  error: Error,
  context: WorkspaceSchemaBuilderContext,
) => {
  if (error instanceof QueryFailedError) {
    if (
      error.message.includes('duplicate key value violates unique constraint')
    ) {
      const indexNameMatch = error.message.match(/"([^"]+)"/);

      if (indexNameMatch) {
        const indexName = indexNameMatch[1];

        const deletedAtFieldMetadata = context.objectMetadataItem.fields.find(
          (field) => field.name === 'deletedAt',
        );

        const affectedColumns = context.objectMetadataItem.indexMetadatas
          .find((index) => index.name === indexName)
          ?.indexFieldMetadatas?.filter(
            (field) => field.fieldMetadataId !== deletedAtFieldMetadata?.id,
          )
          .map((indexField) => {
            const fieldMetadata = context.objectMetadataItem.fields.find(
              (objectField) => indexField.fieldMetadataId === objectField.id,
            );

            return fieldMetadata?.label;
          });

        const columnNames = affectedColumns?.join(', ');

        if (affectedColumns?.length === 1) {
          throw new UserInputError(
            `Duplicate ${columnNames}. Please set a unique one.`,
          );
        }

        throw new UserInputError(
          `A duplicate entry was detected. The combination of ${columnNames} must be unique.`,
        );
      }
    }

    throw error;
  }

  if (error instanceof WorkspaceQueryRunnerException) {
    switch (error.code) {
      case WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
        throw new UserInputError(error.message);
      case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_UNIQUE_CONSTRAINT:
      case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT:
      case WorkspaceQueryRunnerExceptionCode.TOO_MANY_ROWS_AFFECTED:
      case WorkspaceQueryRunnerExceptionCode.NO_ROWS_AFFECTED:
        throw new ForbiddenError(error.message);
      case WorkspaceQueryRunnerExceptionCode.QUERY_TIMEOUT:
        throw new TimeoutError(error.message);
      case WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        throw new InternalServerError(error.message);
    }
  }

  if (error instanceof GraphqlQueryRunnerException) {
    switch (error.code) {
      case GraphqlQueryRunnerExceptionCode.INVALID_ARGS_FIRST:
      case GraphqlQueryRunnerExceptionCode.INVALID_ARGS_LAST:
      case GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND:
      case GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED:
      case GraphqlQueryRunnerExceptionCode.INVALID_CURSOR:
      case GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION:
      case GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR:
      case GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT:
      case GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND:
        throw new UserInputError(error.message);
      case GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND:
        throw new NotFoundError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};
