import { PersonChip } from '@/people/components/PersonChip';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconUserCircle } from '@/ui/icon';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
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
              <PersonChip
                id={company.accountOwner.id}
                name={company.accountOwner?.displayName ?? ''}
                pictureUrl={company.accountOwner?.avatarUrl ?? ''}
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!company.accountOwner}
        />
      </RecoilScope>
    </RecoilScope>
  );
}
