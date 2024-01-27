import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';

type ActivityTargetsInlineCellProps = {
  activity?: Pick<GraphQLActivity, 'id'> & {
    activityTargets?: {
      edges: Array<{
        node: Pick<ActivityTarget, 'id'>;
      }> | null;
    };
  };
};

export const ActivityTargetsInlineCell = ({
  activity,
}: ActivityTargetsInlineCellProps) => {
  const { activityTargetObjectRecords } = useActivityTargetObjectRecords({
    activityId: activity?.id ?? '',
  });

  return (
    <RecordFieldInputScope recordFieldInputScopeId={activity?.id ?? ''}>
      <RecordInlineCellContainer
        buttonIcon={IconPencil}
        customEditHotkeyScope={{
          scope: RelationPickerHotkeyScope.RelationPicker,
        }}
        IconLabel={IconArrowUpRight}
        editModeContent={
          <ActivityTargetInlineCellEditMode
            activityId={activity?.id ?? ''}
            activityTargetObjectRecords={activityTargetObjectRecords as any}
          />
        }
        label="Relations"
        displayModeContent={
          <ActivityTargetChips
            activityTargetObjectRecords={activityTargetObjectRecords}
          />
        }
        isDisplayModeContentEmpty={activityTargetObjectRecords.length === 0}
      />
    </RecordFieldInputScope>
  );
};
