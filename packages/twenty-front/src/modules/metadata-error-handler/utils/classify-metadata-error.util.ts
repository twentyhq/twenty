import { type ApolloError } from '@apollo/client';
import {
  AllMetadataName,
  MetadataValidationErrorResponse,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export type MetadataErrorClassification =
  | { type: 'v1'; error: ApolloError }
  | {
      type: 'v2-validation';
      extensions: MetadataValidationErrorResponse;
      targetEntity: AllMetadataName;
      relatedEntities: AllMetadataName[];
    }
  | {
      type: 'v2-internal';
      code: WorkspaceMigrationV2ExceptionCode;
      message: string;
    };

const isMetadataValidationError = (
  extensions: Record<string, unknown>,
): extensions is MetadataValidationErrorResponse =>
  extensions.code === 'METADATA_VALIDATION_FAILED';

const isMetadataInternalError = (
  extensions: Record<string, unknown>,
): boolean => {
  return (
    isDefined(extensions) &&
    isDefined(extensions.subCode) &&
    (extensions.subCode ===
      WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR ||
      extensions.subCode ===
        WorkspaceMigrationV2ExceptionCode.RUNNER_INTERNAL_SERVER_ERROR)
  );
};

export const classifyMetadataError = (
  error: ApolloError,
  primaryEntityType: AllMetadataName,
): MetadataErrorClassification => {
  const extensions = error.graphQLErrors?.[0]?.extensions;

  if (!isDefined(extensions)) {
    return { type: 'v1', error };
  }

  if (isMetadataValidationError(extensions)) {
    const allEntityTypes = Object.keys(extensions.errors) as [
      keyof MetadataValidationErrorResponse['errors'],
    ];
    const entitiesWithErrors = allEntityTypes.filter(
      (entityType) => extensions.errors[entityType].length > 0,
    );

    const relatedEntities = entitiesWithErrors.filter(
      (entityType) => entityType !== primaryEntityType,
    );

    return {
      type: 'v2-validation',
      extensions,
      targetEntity: primaryEntityType,
      relatedEntities,
    };
  }

  if (isMetadataInternalError(extensions)) {
    return {
      type: 'v2-internal',
      code: extensions.subCode as WorkspaceMigrationV2ExceptionCode,
      message: (extensions.userFriendlyMessage as string) || error.message,
    };
  }

  return { type: 'v1', error };
};
