import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isDefined } from 'twenty-shared/utils';

type RecordFieldListCellEditModePortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
};

export const RecordFieldListCellEditModePortal = ({
  objectMetadataItem,
  recordId,
}: RecordFieldListCellEditModePortalProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldListComponentInstanceContext,
  );

  const editModePosition = useRecoilComponentValue(
    recordFieldListCellEditModePositionComponentState,
  );

  const { editedFieldMetadataItem } = useFieldListFieldMetadataFromPosition({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

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
