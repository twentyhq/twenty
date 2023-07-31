import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconUserCircle } from '@/ui/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { UserChip } from '@/users/components/UserChip';
import { Company, User } from '~/generated/graphql';

import { CompanyAccountOwnerPickerFieldEditMode } from './CompanyAccountOwnerPickerFieldEditMode';

type OwnProps = {
  company: Pick<Company, 'id' | 'accountOwnerId'> & {
    accountOwner?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

export function CompanyAccountOwnerEditableField({ company }: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={<IconUserCircle />}
          editModeContent={
            <CompanyAccountOwnerPickerFieldEditMode company={company} />
          }
          displayModeContent={
            company.accountOwner?.displayName ? (
              <UserChip
                id={company.accountOwner.id}
                name={company.accountOwner?.displayName ?? ''}
                pictureUrl={company.accountOwner?.avatarUrl ?? ''}
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!company.accountOwner}
          isDisplayModeFixHeight={true}
        />
      </RecoilScope>
    </RecoilScope>
  );
}
