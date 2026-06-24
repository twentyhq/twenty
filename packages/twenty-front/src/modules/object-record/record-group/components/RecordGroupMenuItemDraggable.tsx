import { RecordGroupRelationChip } from '@/object-record/record-group/components/RecordGroupRelationChip';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { isRelationValueRecordGroup } from '@/object-record/record-group/utils/isRelationValueRecordGroup';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { MenuItemDraggable } from 'twenty-ui/navigation';

type RecordGroupMenuItemDraggableProps = {
  recordGroupId: string;
  showDragGrip?: boolean;
  isDraggable?: boolean;
  onVisibilityChange: (recordGroupDefinition: RecordGroupDefinition) => void;
  isVisibleLimitReached?: boolean;
};

export const RecordGroupMenuItemDraggable = ({
  recordGroupId,
  showDragGrip,
  isDraggable,
  onVisibilityChange,
  isVisibleLimitReached = false,
}: RecordGroupMenuItemDraggableProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordGroupId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  const isNoValue =
    recordGroupDefinition.type === RecordGroupDefinitionType.NoValue;

  const isRelationValueGroup = isRelationValueRecordGroup({
    fieldMetadataItem: recordIndexGroupFieldMetadataItem,
    recordGroupDefinition,
  });

  const getIconButtons = (recordGroupDefinition: RecordGroupDefinition) => {
    const groupValue = recordGroupDefinition.value;

    if (!recordGroupDefinition.isVisible && isVisibleLimitReached) {
      return undefined;
    }

    const iconButtons = [
      {
        Icon: recordGroupDefinition.isVisible ? IconEyeOff : IconEye,
        ariaLabel: recordGroupDefinition.isVisible
          ? t`Hide group ${groupValue ?? ''}`
          : t`Show group ${groupValue ?? ''}`,
        dataTestId: recordGroupDefinition.isVisible
          ? `hide-group-${recordGroupDefinition.value?.toLowerCase().replace(' ', '-') ?? ''}`
          : `show-group-${recordGroupDefinition.value?.toLowerCase().replace(' ', '-') ?? ''}`,
        onClick: () =>
          onVisibilityChange({
            ...recordGroupDefinition,
            isVisible: !recordGroupDefinition.isVisible,
          }),
      },
    ].filter(isDefined);

    return iconButtons.length ? iconButtons : undefined;
  };

  return (
    <MenuItemDraggable
      key={recordGroupDefinition.id}
      text={
        isRelationValueGroup ? (
          <RecordGroupRelationChip
            fieldMetadataItem={recordIndexGroupFieldMetadataItem!}
            recordId={recordGroupDefinition.value!}
          />
        ) : (
          <Tag
            variant={
              recordGroupDefinition.type !== RecordGroupDefinitionType.NoValue
                ? 'solid'
                : 'outline'
            }
            color={
              recordGroupDefinition.type !== RecordGroupDefinitionType.NoValue
                ? recordGroupDefinition.color
                : 'transparent'
            }
            text={recordGroupDefinition.title}
            weight={
              recordGroupDefinition.type !== RecordGroupDefinitionType.NoValue
                ? 'regular'
                : 'medium'
            }
          />
        )
      }
      accent={isNoValue || showDragGrip ? 'placeholder' : 'default'}
      iconButtons={getIconButtons(recordGroupDefinition)}
      gripMode={isNoValue || showDragGrip ? 'always' : 'never'}
      isDragDisabled={!isDraggable}
    />
  );
};
