import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useIsRecordFieldReadOnly } from '@/object-record/record-field/ui/hooks/read-only/useIsRecordFieldReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellAnchoredPortalContext } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortalContext';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

type RecordInlineCellAnchoredPortalProps = {
  position: number;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'name' | 'type' | 'createdAt' | 'updatedAt' | 'label'
  >;
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
  anchorIdPrefix: string;
  children: React.ReactNode;
};

export const RecordInlineCellAnchoredPortal = ({
  position,
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
  anchorIdPrefix,
  children,
}: RecordInlineCellAnchoredPortalProps) => {
  const anchorElement = document.body.querySelector<HTMLAnchorElement>(
    `#${anchorIdPrefix}-${position}`,
  );

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
    <FieldFocusContextProvider isFocused={true}>
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
                  prefix: 'inline-cell',
                }),
              }}
            >
              <RecordInlineCellAnchoredPortalContext>
                {children}
              </RecordInlineCellAnchoredPortalContext>
            </RecordFieldComponentInstanceContext.Provider>,
            anchorElement,
          )}
        </>
      </FieldContext.Provider>
    </FieldFocusContextProvider>
  );
};
