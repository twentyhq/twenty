import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { isJunctionRelationForbidden } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationForbidden';
import { RecordInlineCellAnchoredPortalContext } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortalContext';
import { RecordInlineCellCloseOnCommandMenuOpeningEffect } from '@/object-record/record-inline-cell/components/RecordInlineCellCloseOnCommandMenuOpeningEffect';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

type RecordInlineCellAnchoredPortalProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    | 'id'
    | 'name'
    | 'type'
    | 'createdAt'
    | 'updatedAt'
    | 'label'
    | 'settings'
    | 'relation'
  >;
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
  instanceIdPrefix: string;
  children: React.ReactNode;
  onCloseEditMode?: () => void;
};

export const RecordInlineCellAnchoredPortal = ({
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
  instanceIdPrefix,
  children,
  onCloseEditMode,
}: RecordInlineCellAnchoredPortalProps) => {
  const fieldInstanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldMetadataItem.name,
    prefix: instanceIdPrefix,
  });

  const anchorElement = document.body.querySelector<HTMLAnchorElement>(
    `#${fieldInstanceId}`,
  );

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    fieldMetadataId: fieldMetadataItem.id,
    objectMetadataId: objectMetadataItem.id,
    recordId: recordId ?? '',
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItems } = useObjectMetadataItems();

  const isForbidden = isJunctionRelationForbidden({
    fieldMetadataItem,
    sourceObjectMetadataId: objectMetadataItem.id,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const useUpdateOneObjectRecordMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord({
        objectNameSingular: objectMetadataItem.nameSingular,
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
          isForbidden,
          onCloseEditMode,
        }}
      >
        <>
          {createPortal(
            <RecordFieldComponentInstanceContext.Provider
              value={{
                instanceId: fieldInstanceId,
              }}
            >
              <RecordInlineCellAnchoredPortalContext>
                {children}

                <RecordInlineCellCloseOnCommandMenuOpeningEffect />
              </RecordInlineCellAnchoredPortalContext>
            </RecordFieldComponentInstanceContext.Provider>,
            anchorElement,
          )}
        </>
      </FieldContext.Provider>
    </FieldFocusContextProvider>
  );
};
