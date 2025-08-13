import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordFieldListCellAnchorPortalContext } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellAnchorPortalContext';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsRecordFieldReadOnly } from '@/object-record/record-field/ui/hooks/read-only/useIsRecordFieldReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellHoveredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortal';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

type RecordFieldListCellAnchoredPortalProps = {
  position: number;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'name' | 'type' | 'createdAt' | 'updatedAt' | 'label'
  >;
  children: React.ReactNode;
};

export const RecordFieldListCellAnchoredPortal = ({
  position,
  fieldMetadataItem,
  children,
}: RecordFieldListCellAnchoredPortalProps) => {
  const anchorElement = document.body.querySelector<HTMLAnchorElement>(
    `#record-field-list-cell-${position}`,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const targetedRecordsRuleFromContextStore = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  let recordId;

  if (targetedRecordsRuleFromContextStore.mode === 'selection') {
    recordId = targetedRecordsRuleFromContextStore.selectedRecordIds[0];
  }

  const INPUT_ID_PREFIX = 'fields-card';

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    fieldMetadataId: fieldMetadataItem.id,
    objectMetadataId: objectMetadataItem.id,
    recordId: recordId ?? '',
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  if (!isDefined(anchorElement) || !isDefined(recordId)) {
    return null;
  }

  return (
    <FieldContext.Provider
      key={recordId + fieldMetadataItem.id}
      value={{
        recordId,
        maxWidth: 200,
        isLabelIdentifier: false,
        fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
          field: fieldMetadataItem,
          position: 0,
          objectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
        useUpdateRecord: useUpdateOneObjectRecordMutation,
        isDisplayModeFixHeight: true,
        isRecordFieldReadOnly,
      }}
    >
      <>
        {createPortal(
          <RecordFieldComponentInstanceContext.Provider
            value={{
              instanceId: getRecordFieldInputInstanceId({
                recordId,
                fieldName: fieldMetadataItem.name,
                prefix: INPUT_ID_PREFIX,
              }),
            }}
          >
            <RecordFieldListCellAnchorPortalContext>
              <RecordInlineCellHoveredPortal>
                {children}
              </RecordInlineCellHoveredPortal>
            </RecordFieldListCellAnchorPortalContext>
          </RecordFieldComponentInstanceContext.Provider>,
          anchorElement,
        )}
      </>
    </FieldContext.Provider>
  );
};
