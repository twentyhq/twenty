import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { Company } from '@/companies/types/Company';
import { Person } from '@/people/types/Person';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecordInlineCellContainer } from '@/ui/object/record-inline-cell/components/RecordInlineCellContainer';
import { FieldRecoilScopeContext } from '@/ui/object/record-inline-cell/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

type ActivityTargetsInlineCellProps = {
  activity?: Pick<GraphQLActivity, 'id'> & {
    activityTargets?: {
      edges: Array<{
        node: Pick<ActivityTarget, 'id' | 'personId' | 'companyId'> & {
          person?: Pick<Person, 'id' | 'name' | 'avatarUrl'> | null;
          company?: Pick<Company, 'id' | 'domainName' | 'name'> | null;
        };
      }> | null;
    };
  };
};

export const ActivityTargetsInlineCell = ({
  activity,
}: ActivityTargetsInlineCellProps) => {
  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <RecordInlineCellContainer
        buttonIcon={IconPencil}
        customEditHotkeyScope={{
          scope: RelationPickerHotkeyScope.RelationPicker,
        }}
        IconLabel={IconArrowUpRight}
        editModeContent={
          <ActivityTargetInlineCellEditMode activity={activity} />
        }
        label="Relations"
        displayModeContent={
          <ActivityTargetChips targets={activity?.activityTargets?.edges} />
        }
        isDisplayModeContentEmpty={
          activity?.activityTargets?.edges?.length === 0
        }
      />
    </RecoilScope>
  );
};
