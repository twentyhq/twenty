import { type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';

import { classifyMetadataError } from '@/metadata-error-handler/utils/classify-metadata-error.util';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';

export const useMetadataErrorHandler = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const TRANSLATED_METADATA_NAME = {
    objectMetadata: t`object`,
    fieldMetadata: t`field`,
    view: t`view`,
    viewField: t`view field`,
    viewGroup: t`view group`,
    viewFilter: t`view filter`,
    index: t`index`,
    serverlessFunction: t`serverless function`,
    cronTrigger: t`cron trigger`,
    databaseEventTrigger: t`database trigger`,
    routeTrigger: t`route trigger`,
    role: t`role`,
    roleTarget: t`role target`,
    agent: t`agent`,
    skill: t`skill`,
    pageLayout: t`page layout`,
    pageLayoutTab: t`page layout tab`,
    pageLayoutWidget: t`page layout widget`,
    rowLevelPermissionPredicate: t`row level permission predicate`,
    rowLevelPermissionPredicateGroup: t`row level permission predicate group`,
    viewFilterGroup: t`view filter group`,
  } as const satisfies Record<AllMetadataName, string>;

  const handleMetadataError = useCallback(
    (
      error: ApolloError,
      options: {
        primaryMetadataName: AllMetadataName;
      },
    ) => {
      const classification = classifyMetadataError({
        error,
        primaryMetadataName: options.primaryMetadataName,
      });

      const translatedMetadataName =
        TRANSLATED_METADATA_NAME[options.primaryMetadataName];

      switch (classification.type) {
        case 'v1':
          enqueueErrorSnackBar({ apolloError: classification.error });
          break;

        case 'v2-validation': {
          const {
            extensions,
            primaryMetadataName,
            relatedFailingMetadataNames,
          } = classification;

          const targetErrors = extensions.errors[primaryMetadataName] ?? [];
          if (targetErrors.length > 0) {
            targetErrors.forEach((entityError) => {
              entityError.errors.forEach((validationError) =>
                enqueueErrorSnackBar({
                  message:
                    validationError.userFriendlyMessage ??
                    validationError.message,
                }),
              );
            });
          }

          if (
            targetErrors.length === 0 &&
            relatedFailingMetadataNames.length > 0
          ) {
            const relatedEntityNames = relatedFailingMetadataNames
              .map((metadataName) => TRANSLATED_METADATA_NAME[metadataName])
              .join(', ');

            enqueueErrorSnackBar({
              message: t`Failed to create ${translatedMetadataName}. Related ${relatedEntityNames} validation failed. Please check your configuration and try again.`,
            });
          }

          if (
            targetErrors.length === 0 &&
            relatedFailingMetadataNames.length === 0
          ) {
            enqueueErrorSnackBar({
              message: t`Failed to create ${translatedMetadataName}. Please try again.`,
            });
          }
          break;
        }

        case 'v2-internal': {
          const { code } = classification;
          const errorMessage =
            code ===
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR
              ? t`An internal error occurred while validating your changes. Please contact support.`
              : t`An internal error occurred while applying your changes. Please contact support and try again later.`;

          enqueueErrorSnackBar({ message: errorMessage });
          break;
        }
      }
    },
    [enqueueErrorSnackBar, TRANSLATED_METADATA_NAME],
  );

  return {
    handleMetadataError,
  };
};
