import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

type UseFieldListFieldMetadataFromPositionProps = {
  objectNameSingular: string;
};

export const useFieldListFieldMetadataFromPosition = ({
  objectNameSingular,
}: UseFieldListFieldMetadataFromPositionProps) => {
  const recordFieldListHoverPosition = useAtomComponentStateValue(
    recordFieldListHoverPositionComponentState,
  );

  const recordFieldListCellEditModePosition = useAtomComponentStateValue(
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

  const hoveredFieldMetadataItem = isDefined(recordFieldListHoverPosition)
    ? fieldMetadataItems.at(recordFieldListHoverPosition)
    : undefined;

  const editedFieldMetadataItem = isDefined(recordFieldListCellEditModePosition)
    ? fieldMetadataItems.at(recordFieldListCellEditModePosition)
    : undefined;

  return {
    hoveredFieldMetadataItem,
    editedFieldMetadataItem,
  };
};
