import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { IconArrowUpRight, IconPencil } from '@/ui/display/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecordInlineCellContainer } from '@/ui/object/record-inline-cell/components/RecordInlineCellContainer';
import { FieldRecoilScopeContext } from '@/ui/object/record-inline-cell/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Company, Person } from '~/generated/graphql';

import { ActivityRelationEditableFieldEditMode } from './ActivityRelationEditableFieldEditMode';

type ActivityRelationEditableFieldProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'personId' | 'companyId'> & {
        person?: Pick<Person, 'id' | 'firstName' | 'lastName'> | null;
        company?: Pick<Company, 'id' | 'domainName' | 'name'> | null;
      }
    > | null;
  };
};

export const ActivityRelationEditableField = ({
  activity,
}: ActivityRelationEditableFieldProps) => {
  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <RecoilScope>
        <RecordInlineCellContainer
          buttonIcon={IconPencil}
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          IconLabel={IconArrowUpRight}
          editModeContent={
            <ActivityRelationEditableFieldEditMode activity={activity} />
          }
          label="Relations"
          displayModeContent={
            <ActivityTargetChips targets={activity?.activityTargets} />
          }
          isDisplayModeContentEmpty={activity?.activityTargets?.length === 0}
        />
      </RecoilScope>
    </RecoilScope>
  );
};
