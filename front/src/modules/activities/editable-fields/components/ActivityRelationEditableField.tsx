import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldRecoilScopeContext } from '@/ui/editable-field/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { IconArrowUpRight } from '@/ui/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Activity, ActivityTarget, Company, Person } from '~/generated/graphql';

import { ActivityRelationEditableFieldEditMode } from './ActivityRelationEditableFieldEditMode';

type OwnProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'personId' | 'companyId'> & {
        person?: Pick<Person, 'id' | 'displayName'>;
        company?: Pick<Company, 'id' | 'domainName' | 'name'>;
      }
    > | null;
  };
};

export function ActivityRelationEditableField({ activity }: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <RecoilScope>
        <EditableField
          useEditButton
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={<IconArrowUpRight />}
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
}
