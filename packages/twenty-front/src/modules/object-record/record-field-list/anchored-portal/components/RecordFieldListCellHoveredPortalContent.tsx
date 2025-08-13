import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellHoveredPortalContent } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortalContent';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordFieldListCellHoveredPortalContentProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const RecordFieldListCellHoveredPortalContent = ({
  objectMetadataItem,
}: RecordFieldListCellHoveredPortalContentProps) => {
  const hoverPosition = useRecoilComponentValue(
    recordFieldListHoverPositionComponentState,
  );

  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();

  const { hoveredFieldMetadataItem } = useFieldListFieldMetadataFromPosition({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { isRecordFieldReadOnly } = useContext(FieldContext);
  const { openInlineCell } = useInlineCell();

  const shouldContainerBeClickable =
    !isRecordFieldReadOnly && !editModeContentOnly;

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    'fields-card',
  );

  const handleMouseLeave = () => {
    setRecordFieldListHoverPosition(null);
  };

  if (!isDefined(hoverPosition) || !isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellHoveredPortalContent
      readonly={isRecordFieldReadOnly}
      isCentered={isCentered}
      onClick={shouldContainerBeClickable ? openInlineCell : undefined}
      onMouseLeave={handleMouseLeave}
    >
      <RecordInlineCellDisplayMode>
        {editModeContentOnly ? <FieldInput /> : <FieldDisplay />}
      </RecordInlineCellDisplayMode>
    </RecordInlineCellHoveredPortalContent>
  );
};
