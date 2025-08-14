import { useRecordDetailSectionFieldMetadataItems } from '@/object-record/record-show/record-detail-section/hooks/useRecordDetailSectionFieldMetadataItems';
import { recordDetailSectionCellEditModePositionComponentState } from '@/object-record/record-show/record-detail-section/states/recordDetailSectionCellEditModePositionComponentState';
import { recordDetailSectionHoverPositionComponentState } from '@/object-record/record-show/record-detail-section/states/recordDetailSectionHoverPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { undefined } from 'zod';

type UseRecordDetailSectionMetadataFromPositionProps = {
  objectNameSingular: string;
  excludeFieldMetadataIds: string[];
};

export const useRecordDetailSectionMetadataFromPosition = ({
  objectNameSingular,
  excludeFieldMetadataIds,
}: UseRecordDetailSectionMetadataFromPositionProps) => {
  const hoverPosition = useRecoilComponentValue(
    recordDetailSectionHoverPositionComponentState,
  );

  const editModePosition = useRecoilComponentValue(
    recordDetailSectionCellEditModePositionComponentState,
  );

  const { fieldMetadataItems } = useRecordDetailSectionFieldMetadataItems({
    objectNameSingular,
    excludeFieldMetadataIds,
  });

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
