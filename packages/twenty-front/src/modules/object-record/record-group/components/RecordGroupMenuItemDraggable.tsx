import { IconEye, IconEyeOff, MenuItemDraggable, Tag } from 'twenty-ui';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

type RecordGroupMenuItemDraggableProps = {
  recordGroupId: string;
  showDragGrip?: boolean;
  isDraggable?: boolean;
  onVisibilityChange: (recordGroup: RecordGroupDefinition) => void;
};

export const RecordGroupMenuItemDraggable = ({
  recordGroupId,
  showDragGrip,
  isDraggable,
  onVisibilityChange,
}: RecordGroupMenuItemDraggableProps) => {
  const recordGroup = useRecoilValue(
    recordGroupDefinitionFamilyState(recordGroupId),
  );

  if (!isDefined(recordGroup)) {
    return null;
  }

  const isNoValue = recordGroup.type === RecordGroupDefinitionType.NoValue;

  const getIconButtons = (recordGroup: RecordGroupDefinition) => {
    const iconButtons = [
      {
        Icon: recordGroup.isVisible ? IconEyeOff : IconEye,
        onClick: () =>
          onVisibilityChange({
            ...recordGroup,
            isVisible: !recordGroup.isVisible,
          }),
      },
    ].filter(isDefined);

    return iconButtons.length ? iconButtons : undefined;
  };

  return (
    <MenuItemDraggable
      key={recordGroup.id}
      text={
        <Tag
          variant={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? 'solid'
              : 'outline'
          }
          color={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? recordGroup.color
              : 'transparent'
          }
          text={recordGroup.title}
          weight={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? 'regular'
              : 'medium'
          }
        />
      }
      accent={isNoValue || showDragGrip ? 'placeholder' : 'default'}
      iconButtons={getIconButtons(recordGroup)}
      showGrip={isNoValue ? true : showDragGrip}
      isDragDisabled={!isDraggable}
    />
  );
};
