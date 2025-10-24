import { type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AllMetadataName, FailedMetadataValidationError, WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';
import { classifyMetadataError } from '../utils/classify-metadata-error.util';

type DisplayErrorOptions = {
  primaryEntityType: AllMetadataName;
  entityDisplayName?: string;
};

const ENTITY_DISPLAY_NAMES: Record<AllMetadataName, string> = {
  objectMetadata: t`object`,
  fieldMetadata: t`field`,
  view: t`view`,
  viewField: t`view field`,
  viewGroup: t`view group`,
  viewFilter: t`view filter`,
  index: t`index`,
  serverlessFunction: t`function`,
  cronTrigger: t`cron trigger`,
  databaseEventTrigger: t`database trigger`,
  routeTrigger: t`route trigger`,
};

const getEntityDisplayName = (entityType: AllMetadataName): string => {
  return ENTITY_DISPLAY_NAMES[entityType] || entityType;
};

const formatValidationError = (
  error: FailedMetadataValidationError,
): string => {
  return error.userFriendlyMessage ?? error.message;
};

export const useMetadataErrorHandler = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleMetadataError = useCallback(
    (error: ApolloError, options: DisplayErrorOptions) => {
      const classification = classifyMetadataError(
        error,
        options.primaryEntityType,
      );

      const { entityDisplayName } = options;
      const displayName =
        entityDisplayName || getEntityDisplayName(options.primaryEntityType);

      switch (classification.type) {
        case 'v1':
          enqueueErrorSnackBar({ apolloError: classification.error });
          break;

        case 'v2-validation': {
          const { extensions, targetEntity, relatedEntities } = classification;

          const targetErrors = extensions.errors[targetEntity] || [];
          if (targetErrors.length > 0) {
            targetErrors.forEach((entityError) => {
              entityError.errors.forEach((validationError) => {
                const errorMessage = formatValidationError(validationError);
                enqueueErrorSnackBar({ message: errorMessage });
              });
            });
          }

          if (targetErrors.length === 0 && relatedEntities.length > 0) {
            const relatedEntityNames = relatedEntities
              .map((entityType) => getEntityDisplayName(entityType))
              .join(', ');

            enqueueErrorSnackBar({
              message: t`Failed to create ${displayName}. Related ${relatedEntityNames} validation failed. Please check your configuration and try again.`,
            });
          }

          if (targetErrors.length === 0 && relatedEntities.length === 0) {
            enqueueErrorSnackBar({
              message: t`Failed to create ${displayName}. Please try again.`,
            });
          }
          break;
        }

        case 'v2-internal': {
          const { code } = classification;
          const errorMessage =
            code === WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR
              ? t`An internal error occurred while validating your changes. Please contact support.`
              : t`An internal error occurred while applying your changes. Please contact support and try again later.`;

          enqueueErrorSnackBar({ message: errorMessage });
          break;
        }
      }
    },
    [enqueueErrorSnackBar],
  );

  return {
    handleMetadataError,
  };
};
