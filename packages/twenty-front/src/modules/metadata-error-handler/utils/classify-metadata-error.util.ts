import { type ApolloError } from '@apollo/client';
import {
  type MetadataEntityType,
  MetadataInternalErrorCode,
  type MetadataValidationErrorExtensions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type MetadataErrorClassification =
  | { type: 'v1'; error: ApolloError }
  | {
      type: 'v2-validation';
      extensions: MetadataValidationErrorExtensions;
      targetEntity: MetadataEntityType;
      relatedEntities: MetadataEntityType[];
    }
  | {
      type: 'v2-internal';
      code: MetadataInternalErrorCode;
      message: string;
    };

const isMetadataValidationError = (
  extensions: Record<string, unknown>,
): extensions is MetadataValidationErrorExtensions =>
  extensions.code === 'METADATA_VALIDATION_FAILED';

const isMetadataInternalError = (
  extensions: Record<string, unknown>,
): boolean => {
  return (
    isDefined(extensions) &&
    isDefined(extensions.subCode) &&
    (extensions.subCode ===
      MetadataInternalErrorCode.BUILDER_INTERNAL_SERVER_ERROR ||
      extensions.subCode ===
        MetadataInternalErrorCode.RUNNER_INTERNAL_SERVER_ERROR)
  );
};

export const classifyMetadataError = (
  error: ApolloError,
  primaryEntityType: MetadataEntityType,
): MetadataErrorClassification => {
  const extensions = error.graphQLErrors?.[0]?.extensions;

  if (!isDefined(extensions)) {
    return { type: 'v1', error };
  }

  if (isMetadataValidationError(extensions)) {
    const allEntityTypes = Object.keys(extensions.errors) as [
      keyof MetadataValidationErrorExtensions['errors'],
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
      code: extensions.subCode as MetadataInternalErrorCode,
      message: (extensions.userFriendlyMessage as string) || error.message,
    };
  }

  return { type: 'v1', error };
};
