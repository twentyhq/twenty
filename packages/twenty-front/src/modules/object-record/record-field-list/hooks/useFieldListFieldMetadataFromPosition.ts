import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

type UseFieldListFieldMetadataFromPositionProps = {
  objectNameSingular: string;
};

export const useFieldListFieldMetadataFromPosition = ({
  objectNameSingular,
}: UseFieldListFieldMetadataFromPositionProps) => {
  const hoverPosition = useRecoilComponentValueV2(
    recordFieldListHoverPositionComponentState,
  );

  const editModePosition = useRecoilComponentValueV2(
    recordFieldListCellEditModePositionComponentState,
  );

  const {
    inlineFieldMetadataItems,
    legacyActivityTargetFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
  });

  const fieldMetadataItems = [
    ...legacyActivityTargetFieldMetadataItems,
    ...inlineFieldMetadataItems,
    ...boxedRelationFieldMetadataItems,
  ];

  const hoveredFieldMetadataItem = isDefined(hoverPosition)
    ? fieldMetadataItems.at(hoverPosition)
    : undefined;

  const editedFieldMetadataItem = isDefined(editModePosition)
    ? fieldMetadataItems.at(editModePosition)
    : undefined;

  return {
    hoveredFieldMetadataItem,
    editedFieldMetadataItem,
  };
};
