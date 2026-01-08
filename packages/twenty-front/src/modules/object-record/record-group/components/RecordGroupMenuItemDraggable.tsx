import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { IconEye, IconEyeOff } from 'twenty-ui/display';
import { MenuItemDraggable } from 'twenty-ui/navigation';

type RecordGroupMenuItemDraggableProps = {
  recordGroupId: string;
  showDragGrip?: boolean;
  isDraggable?: boolean;
  onVisibilityChange: (recordGroup: RecordGroupDefinition) => void;
  isVisibleLimitReached?: boolean;
};

export const RecordGroupMenuItemDraggable = ({
  recordGroupId,
  showDragGrip,
  isDraggable,
  onVisibilityChange,
  isVisibleLimitReached = false,
}: RecordGroupMenuItemDraggableProps) => {
  const recordGroup = useRecoilValue(
    recordGroupDefinitionFamilyState(recordGroupId),
  );

  if (!isDefined(recordGroup)) {
    return null;
  }

  const isNoValue = recordGroup.type === RecordGroupDefinitionType.NoValue;

  const getIconButtons = (recordGroup: RecordGroupDefinition) => {
    const groupValue = recordGroup.value;

    if (!recordGroup.isVisible && isVisibleLimitReached) {
      return undefined;
    }

    const iconButtons = [
      {
        Icon: recordGroup.isVisible ? IconEyeOff : IconEye,
        ariaLabel: recordGroup.isVisible
          ? t`Hide group ${groupValue}`
          : t`Show group ${groupValue}`,
        dataTestId: recordGroup.isVisible
          ? `hide-group-${recordGroup.value?.toLowerCase().replace(' ', '-') ?? ''}`
          : `show-group-${recordGroup.value?.toLowerCase().replace(' ', '-') ?? ''}`,
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
