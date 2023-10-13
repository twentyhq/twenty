import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { InlineCellContainer } from '@/ui/Data/Inline Cell/components/InlineCellContainer';
import { FieldRecoilScopeContext } from '@/ui/Data/Inline Cell/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { IconArrowUpRight, IconPencil } from '@/ui/Display/Icon';
import { RelationPickerHotkeyScope } from '@/ui/Input/Relation Picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Activity, ActivityTarget, Company, Person } from '~/generated/graphql';

import { ActivityRelationEditableFieldEditMode } from './ActivityRelationEditableFieldEditMode';

type ActivityRelationEditableFieldProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'personId' | 'companyId'> & {
        person?: Pick<Person, 'id' | 'displayName'>;
        company?: Pick<Company, 'id' | 'domainName' | 'name'>;
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
        <InlineCellContainer
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
