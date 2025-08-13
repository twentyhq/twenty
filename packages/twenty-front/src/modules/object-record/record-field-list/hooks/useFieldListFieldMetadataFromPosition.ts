import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type UseFieldListFieldMetadataFromPositionProps = {
  objectNameSingular: string;
};

export const useFieldListFieldMetadataFromPosition = ({
  objectNameSingular,
}: UseFieldListFieldMetadataFromPositionProps) => {
  const hoverPosition = useRecoilComponentValue(
    recordFieldListHoverPositionComponentState,
  );

  const editModePosition = useRecoilComponentValue(
    recordFieldListCellEditModePositionComponentState,
  );

  const {
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
  });

  const fieldMetadataItems = [
    ...inlineRelationFieldMetadataItems,
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
