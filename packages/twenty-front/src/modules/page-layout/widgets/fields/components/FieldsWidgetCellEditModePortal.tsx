import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

type FieldsWidgetCellEditModePortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
  flattenedFieldMetadataItems: FieldMetadataItem[];
};

export const FieldsWidgetCellEditModePortal = ({
  objectMetadataItem,
  recordId,
  flattenedFieldMetadataItems,
}: FieldsWidgetCellEditModePortalProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldListComponentInstanceContext,
  );

  const editModePosition = useRecoilComponentValueV2(
    recordFieldListCellEditModePositionComponentState,
  );

  const editedFieldMetadataItem = isDefined(editModePosition)
    ? flattenedFieldMetadataItems.at(editModePosition)
    : undefined;

  if (!isDefined(editModePosition) || !isDefined(editedFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={editedFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={instanceId}
    >
      <RecordFieldListInputContextProvider
        fieldMetadataItem={editedFieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
        recordId={recordId}
        instanceIdPrefix={instanceId}
      >
        <RecordInlineCellEditMode>
          <FieldInput />
        </RecordInlineCellEditMode>
      </RecordFieldListInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};
