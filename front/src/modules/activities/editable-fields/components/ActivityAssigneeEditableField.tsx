import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconUserCircle } from '@/ui/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { UserChip } from '@/users/components/UserChip';
import { Company, User } from '~/generated/graphql';

import { ActivityAssigneeEditableFieldEditMode } from './ActivityAssigneeEditableFieldEditMode';

type OwnProps = {
  activity: Pick<Company, 'id' | 'accountOwnerId'> & {
    assignee?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

export function ActivityAssigneeEditableField({ activity }: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          label="Assignee"
          iconLabel={<IconUserCircle />}
          editModeContent={
            <ActivityAssigneeEditableFieldEditMode activity={activity} />
          }
          displayModeContent={
            activity.assignee?.displayName ? (
              <UserChip
                id={activity.assignee.id}
                name={activity.assignee?.displayName ?? ''}
                pictureUrl={activity.assignee?.avatarUrl ?? ''}
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!activity.assignee}
          isDisplayModeFixHeight={true}
        />
      </RecoilScope>
    </RecoilScope>
  );
}
