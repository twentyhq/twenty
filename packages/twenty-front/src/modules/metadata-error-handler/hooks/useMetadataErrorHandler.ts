import { type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';

import { classifyMetadataError } from '@/metadata-error-handler/utils/classify-metadata-error.util';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { CrudOperationType } from 'twenty-shared/types';

export const useMetadataErrorHandler = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const TRANSLATED_OPERATION_TYPE = {
    [CrudOperationType.CREATE]: t`create`,
    [CrudOperationType.UPDATE]: t`update`,
    [CrudOperationType.DELETE]: t`delete`,
    [CrudOperationType.RESTORE]: t`restore`,
    [CrudOperationType.DESTROY]: t`destroy`,
  } as const satisfies Record<CrudOperationType, string>;

  const TRANSLATED_METADATA_NAME = {
    objectMetadata: t`object`,
    fieldMetadata: t`field`,
    view: t`view`,
    viewField: t`view field`,
    viewFieldGroup: t`view field group`,
    viewGroup: t`view group`,
    viewFilter: t`view filter`,
    index: t`index`,
    logicFunction: t`logic function`,
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
    commandMenuItem: t`command menu item`,
    frontComponent: t`front component`,
    navigationMenuItem: t`navigation menu item`,
    webhook: t`webhook`,
  } as const satisfies Record<AllMetadataName, string>;

  const handleMetadataError = (
    error: ApolloError,
    options: {
      primaryMetadataName: AllMetadataName;
      operationType: CrudOperationType;
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
        const { extensions, primaryMetadataName, relatedFailingMetadataNames } =
          classification;

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

        const translatedOperationType =
          TRANSLATED_OPERATION_TYPE[options.operationType];

        if (
          targetErrors.length === 0 &&
          relatedFailingMetadataNames.length > 0
        ) {
          const relatedEntityNames = relatedFailingMetadataNames
            .map((metadataName) => TRANSLATED_METADATA_NAME[metadataName])
            .join(', ');

          enqueueErrorSnackBar({
            message: t`Failed to ${translatedOperationType} ${translatedMetadataName}. Related ${relatedEntityNames} validation failed. Please check your configuration and try again.`,
          });
        }

        if (
          targetErrors.length === 0 &&
          relatedFailingMetadataNames.length === 0
        ) {
          enqueueErrorSnackBar({
            message: t`Failed to ${translatedOperationType} ${translatedMetadataName}. Please try again.`,
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
  };

  return {
    handleMetadataError,
  };
};
