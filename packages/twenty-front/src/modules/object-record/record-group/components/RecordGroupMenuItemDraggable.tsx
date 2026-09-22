import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';
import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

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

  const groupValue = recordGroupDefinition.value;
  const canToggleVisibility =
    recordGroupDefinition.isVisible || !isVisibleLimitReached;

  return (
    <DraggableListItem
      key={recordGroupDefinition.id}
      placeholder={isNoValue || showDragGrip}
      actions={
        canToggleVisibility && (
          <LightIconButton
            aria-label={
              recordGroupDefinition.isVisible
                ? t`Hide group ${groupValue ?? ''}`
                : t`Show group ${groupValue ?? ''}`
            }
            data-testid={
              recordGroupDefinition.isVisible
                ? `hide-group-${groupValue?.toLowerCase().replace(' ', '-') ?? ''}`
                : `show-group-${groupValue?.toLowerCase().replace(' ', '-') ?? ''}`
            }
            onClick={() =>
              onVisibilityChange({
                ...recordGroupDefinition,
                isVisible: !recordGroupDefinition.isVisible,
              })
            }
          >
            {recordGroupDefinition.isVisible ? <IconEyeOff /> : <IconEye />}
          </LightIconButton>
        )
      }
      grip={isNoValue || showDragGrip ? 'always' : 'never'}
      dragDisabled={!isDraggable}
    >
      <RecordGroupChip
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={recordIndexGroupFieldMetadataItem}
      />
    </DraggableListItem>
  );
};
