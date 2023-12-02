import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecordInlineCellContainer } from '@/ui/object/record-inline-cell/components/RecordInlineCellContainer';
import { FieldRecoilScopeContext } from '@/ui/object/record-inline-cell/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

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
  const activityTargetIds =
    activity?.activityTargets?.edges?.map(
      (activityTarget) => activityTarget.node.id,
    ) ?? [];

  const { records: activityTargets } = useFindManyRecords<ActivityTarget>({
    objectNameSingular: 'activityTarget',
    filter: { id: { in: activityTargetIds } },
  });

  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <RecordInlineCellContainer
        buttonIcon={IconPencil}
        customEditHotkeyScope={{
          scope: RelationPickerHotkeyScope.RelationPicker,
        }}
        IconLabel={IconArrowUpRight}
        editModeContent={
          <ActivityTargetInlineCellEditMode
            activityId={activity?.id ?? ''}
            activityTargets={activityTargets as any}
          />
        }
        label="Relations"
        displayModeContent={<ActivityTargetChips targets={activityTargets} />}
        isDisplayModeContentEmpty={
          activity?.activityTargets?.edges?.length === 0
        }
      />
    </RecoilScope>
  );
};
