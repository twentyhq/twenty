import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
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
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';

type RecordGroupVisibilityRowProps = {
  recordGroupId: string;
  showDragGrip?: boolean;
  isDraggable?: boolean;
  onVisibilityChange: (recordGroupDefinition: RecordGroupDefinition) => void;
  isVisibleLimitReached?: boolean;
};

export const RecordGroupVisibilityRow = ({
  recordGroupId,
  showDragGrip,
  isDraggable,
  onVisibilityChange,
  isVisibleLimitReached = false,
}: RecordGroupVisibilityRowProps) => {
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
    <DraggableListRow
      key={recordGroupDefinition.id}
      isMuted={isNoValue || showDragGrip}
      actions={
        canToggleVisibility ? (
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
        ) : undefined
      }
      dragHandleVisibility={isNoValue || showDragGrip ? 'always' : 'none'}
      isDragDisabled={!isDraggable}
    >
      <RecordGroupChip
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={recordIndexGroupFieldMetadataItem}
      />
    </DraggableListRow>
  );
};
