import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { filesFieldUploadState } from '@/object-record/record-field/ui/states/filesFieldUploadState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const useOpenFilesFieldInput = () => {
  const { openFileUpload } = useFileUpload();
  const { uploadFile } = useUploadFilesFieldFile();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const store = useStore();

  const openFilesFieldInput = useCallback(
    async ({
      fieldName,
      fieldMetadataId,
      recordId,
      prefix,
      updateRecord,
      onFileUploadClose,
      fieldDefinition,
    }: {
      fieldName: string;
      fieldMetadataId: string;
      recordId: string;
      prefix?: string;
      updateRecord: (updateInput: Record<string, unknown>) => void;
      onFileUploadClose?: () => void;
      fieldDefinition?: {
        metadata: {
          settings?: {
            maxNumberOfValues?: number;
          };
        };
      };
    }) => {
      const fieldValue = store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId,
          fieldName,
        }),
      ) as FieldFilesValue[];

      const instanceId = getRecordFieldInputInstanceId({
        recordId,
        fieldName,
        prefix,
      });

      if (isDefined(fieldValue) && fieldValue.length > 0) {
        pushFocusItemToFocusStack({
          focusId: instanceId,
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
        return;
      }

      const maxNumberOfValues =
        fieldDefinition?.metadata?.settings?.maxNumberOfValues ??
        MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

      const currentFileCount = isDefined(fieldValue) ? fieldValue.length : 0;

      store.set(
        filesFieldUploadState.atomFamily({ recordId, fieldName }),
        'UPLOAD_WINDOW_OPEN',
      );

      openFileUpload({
        multiple: true,
        onUpload: async (selectedFiles: File[]) => {
          if (selectedFiles.length + currentFileCount > maxNumberOfValues) {
            enqueueErrorSnackBar({
              message: t`Cannot upload more than ${maxNumberOfValues} files`,
            });

            store.set(
              filesFieldUploadState.atomFamily({ recordId, fieldName }),
              null,
            );

            onFileUploadClose?.();
            return;
          }

          store.set(
            filesFieldUploadState.atomFamily({ recordId, fieldName }),
            'UPLOADING_FILE',
          );

          try {
            const uploadedFiles = await uploadMultipleFiles(
              selectedFiles,
              fieldMetadataId,
              uploadFile,
            );

            if (uploadedFiles.length > 0) {
              updateRecord({
                [fieldName]: uploadedFiles,
              });
            }
          } finally {
            store.set(
              filesFieldUploadState.atomFamily({ recordId, fieldName }),
              null,
            );

            onFileUploadClose?.();
          }
        },
        onCancel: () => {
          store.set(
            filesFieldUploadState.atomFamily({ recordId, fieldName }),
            null,
          );

          onFileUploadClose?.();
        },
      });
    },
    [
      openFileUpload,
      uploadFile,
      pushFocusItemToFocusStack,
      enqueueErrorSnackBar,
      t,
      store,
    ],
  );

  return { openFilesFieldInput };
};
