import { IconEye, IconEyeOff, MenuItemDraggable, Tag } from 'twenty-ui';

import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { isDefined } from '~/utils/isDefined';

type RecordGroupMenuItemDraggableProps = {
  recordGroup: RecordGroupDefinition;
  showDragGrip?: boolean;
  isDraggable?: boolean;
  onVisibilityChange: (viewGroup: RecordGroupDefinition) => void;
};

export const RecordGroupMenuItemDraggable = ({
  recordGroup,
  showDragGrip,
  isDraggable,
  onVisibilityChange,
}: RecordGroupMenuItemDraggableProps) => {
  const isNoValue = recordGroup.type === RecordGroupDefinitionType.NoValue;

  const getIconButtons = (recordGroup: RecordGroupDefinition) => {
    const iconButtons = [
      {
        Icon: recordGroup.isVisible ? IconEyeOff : IconEye,
        onClick: () => onVisibilityChange(recordGroup),
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
