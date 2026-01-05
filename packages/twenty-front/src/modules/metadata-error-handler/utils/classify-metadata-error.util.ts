import { type ApolloError } from '@apollo/client';
import {
  type AllMetadataName,
  type MetadataValidationErrorResponse,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export type MetadataErrorClassification =
  | { type: 'v1'; error: ApolloError }
  | {
      type: 'v2-validation';
      extensions: MetadataValidationErrorResponse;
      primaryMetadataName: AllMetadataName;
      relatedFailingMetadataNames: AllMetadataName[];
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

type ClassifyMetadataErrorArgs = {
  error: ApolloError;
  primaryMetadataName: AllMetadataName;
};
export const classifyMetadataError = ({
  error,
  primaryMetadataName,
}: ClassifyMetadataErrorArgs): MetadataErrorClassification => {
  const extensions = error.graphQLErrors?.[0]?.extensions;

  if (!isDefined(extensions)) {
    return { type: 'v1', error };
  }

  if (isMetadataValidationError(extensions)) {
    const failingMetadataNames = Object.keys(extensions.errors) as [
      keyof MetadataValidationErrorResponse['errors'],
    ];
    const relatedFailingMetadataNames = failingMetadataNames.filter(
      (metadataName) =>
        isDefined(extensions.errors[metadataName]) &&
        extensions.errors[metadataName].length > 0 &&
        metadataName !== primaryMetadataName,
    );

    return {
      type: 'v2-validation',
      extensions,
      primaryMetadataName,
      relatedFailingMetadataNames,
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
