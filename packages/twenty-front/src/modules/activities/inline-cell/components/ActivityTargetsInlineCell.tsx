import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { FieldRecoilScopeContext } from '@/object-record/record-inline-cell/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Key } from 'ts-key-enum';

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
  const { closeInlineCell } = useInlineCell();
  useScopedHotkeys(
    Key.Escape,
    () => {
      closeInlineCell();
    },
    ActivityEditorHotkeyScope.ActivityTargets,
  );

  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <RecordInlineCellContainer
        buttonIcon={IconPencil}
        customEditHotkeyScope={{
          scope: ActivityEditorHotkeyScope.ActivityTargets,
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
    </RecoilScope>
  );
};
