import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { useFieldsWidgetFlattenedFields } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetFlattenedFields';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type FieldsWidgetCellEditModePortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
};

export const FieldsWidgetCellEditModePortal = ({
  objectMetadataItem,
  recordId,
}: FieldsWidgetCellEditModePortalProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldListComponentInstanceContext,
  );

  const editModePosition = useRecoilComponentValue(
    recordFieldListCellEditModePositionComponentState,
  );

  const { flattenedFieldMetadataItems } = useFieldsWidgetFlattenedFields(
    objectMetadataItem.nameSingular,
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
