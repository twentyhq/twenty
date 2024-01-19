import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { FieldRecoilScopeContext } from '@/object-record/record-inline-cell/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import useI18n from '@/ui/i18n/useI18n';

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
  const { translate } = useI18n('translations');
  const { activityTargetObjectRecords } = useActivityTargetObjectRecords({
    activityId: activity?.id ?? '',
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
            activityTargetObjectRecords={activityTargetObjectRecords as any}
          />
        }
        label={translate('relations')}
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
