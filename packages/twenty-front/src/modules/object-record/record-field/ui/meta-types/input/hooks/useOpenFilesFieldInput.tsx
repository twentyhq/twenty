import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { useUploadFilesFieldFile } from '@/object-record/record-field/ui/meta-types/hooks/useUploadFilesFieldFile';
import { uploadMultipleFiles } from '@/object-record/record-field/ui/meta-types/utils/uploadMultipleFiles';
import { filesFieldUploadState } from '@/object-record/record-field/ui/states/filesFieldUploadState';
import { filesFieldUploadStateV2 } from '@/object-record/record-field/ui/states/filesFieldUploadStateV2';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveLastFocusItemFromFocusStackByComponentType } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackByComponentType';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useLingui } from '@lingui/react/macro';
import { useRecoilCallback } from 'recoil';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const useOpenFilesFieldInput = () => {
  const { openFileUpload } = useFileUpload();
  const { uploadFile } = useUploadFilesFieldFile();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeLastFocusItemFromFocusStackByComponentType } =
    useRemoveLastFocusItemFromFocusStackByComponentType();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();
  const recordTableId = useAvailableComponentInstanceId(
    RecordTableComponentInstanceContext,
  );
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const openFilesFieldInput = useRecoilCallback(
    ({ snapshot, set }) =>
      async ({
        fieldName,
        fieldMetadataId,
        recordId,
        prefix,
        updateRecord,
        onClose,
        fieldDefinition,
      }: {
        fieldName: string;
        fieldMetadataId: string;
        recordId: string;
        prefix?: string;
        updateRecord: (updateInput: Record<string, unknown>) => void;
        onClose?: () => void;
        fieldDefinition?: {
          metadata: {
            settings?: {
              maxNumberOfValues?: number;
            };
          };
        };
      }) => {
        const fieldValue = snapshot
          .getLoadable<FieldFilesValue[]>(
            recordStoreFamilySelector({
              recordId,
              fieldName,
            }),
          )
          .getValue();

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

        const isTableContext = prefix === RECORD_TABLE_CELL_INPUT_ID_PREFIX;

        const maxNumberOfValues =
          fieldDefinition?.metadata?.settings?.maxNumberOfValues ??
          MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

        const currentFileCount = isDefined(fieldValue) ? fieldValue.length : 0;

        set(
          filesFieldUploadState({ recordId, fieldName }),
          'UPLOAD_WINDOW_OPEN',
        );
        jotaiStore.set(
          filesFieldUploadStateV2.atomFamily({ recordId, fieldName }),
          'UPLOAD_WINDOW_OPEN',
        );

        openFileUpload({
          multiple: true,
          onUpload: async (selectedFiles: File[]) => {
            if (selectedFiles.length + currentFileCount > maxNumberOfValues) {
              enqueueErrorSnackBar({
                message: t`Cannot upload more than ${maxNumberOfValues} files`,
              });

              set(filesFieldUploadState({ recordId, fieldName }), null);
              jotaiStore.set(
                filesFieldUploadStateV2.atomFamily({ recordId, fieldName }),
                null,
              );

              if (isTableContext && isDefined(recordTableId)) {
                set(
                  recordTableCellEditModePositionComponentState.atomFamily({
                    instanceId: recordTableId,
                  }),
                  null,
                );
                goBackToPreviousDropdownFocusId();
                removeLastFocusItemFromFocusStackByComponentType({
                  componentType: FocusComponentType.OPENED_FIELD_INPUT,
                });
              } else {
                onClose?.();
              }
              return;
            }

            set(
              filesFieldUploadState({ recordId, fieldName }),
              'UPLOADING_FILE',
            );
            jotaiStore.set(
              filesFieldUploadStateV2.atomFamily({ recordId, fieldName }),
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
              set(filesFieldUploadState({ recordId, fieldName }), null);
              jotaiStore.set(
                filesFieldUploadStateV2.atomFamily({ recordId, fieldName }),
                null,
              );

              if (isTableContext && isDefined(recordTableId)) {
                set(
                  recordTableCellEditModePositionComponentState.atomFamily({
                    instanceId: recordTableId,
                  }),
                  null,
                );
                goBackToPreviousDropdownFocusId();
                removeLastFocusItemFromFocusStackByComponentType({
                  componentType: FocusComponentType.OPENED_FIELD_INPUT,
                });
              } else {
                onClose?.();
              }
            }
          },
          onCancel: () => {
            set(filesFieldUploadState({ recordId, fieldName }), null);
            jotaiStore.set(
              filesFieldUploadStateV2.atomFamily({ recordId, fieldName }),
              null,
            );

            if (isTableContext && isDefined(recordTableId)) {
              set(
                recordTableCellEditModePositionComponentState.atomFamily({
                  instanceId: recordTableId,
                }),
                null,
              );
              goBackToPreviousDropdownFocusId();
              removeLastFocusItemFromFocusStackByComponentType({
                componentType: FocusComponentType.OPENED_FIELD_INPUT,
              });
            } else {
              onClose?.();
            }
          },
        });
      },
    [
      openFileUpload,
      uploadFile,
      pushFocusItemToFocusStack,
      recordTableId,
      goBackToPreviousDropdownFocusId,
      removeLastFocusItemFromFocusStackByComponentType,
      enqueueErrorSnackBar,
      t,
    ],
  );

  return { openFilesFieldInput };
};
