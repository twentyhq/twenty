import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListCellEditModePortalContent } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellEditModePortalContent';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { isDefined } from 'twenty-shared/utils';

type RecordFieldListCellEditModePortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
};

export const RecordFieldListCellEditModePortal = ({
  objectMetadataItem,
  recordId,
}: RecordFieldListCellEditModePortalProps) => {
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
      position={editModePosition}
      fieldMetadataItem={editedFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      anchorIdPrefix={'record-field-list-inline-cell'}
    >
      <RecordFieldListInputContextProvider>
        <RecordFieldListCellEditModePortalContent />
      </RecordFieldListInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};
