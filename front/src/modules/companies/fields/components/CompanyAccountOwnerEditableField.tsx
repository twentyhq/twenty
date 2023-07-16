import { IconCalendar, IconUser, IconUserCircle } from '@tabler/icons-react';

import { PersonChip } from '@/people/components/PersonChip';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { RelationPickerHotkeyScope } from '@/relation-picker/types/RelationPickerHotkeyScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { Company, User } from '~/generated/graphql';
import { PageHotkeyScope } from '~/sync-hooks/types/PageHotkeyScope';

import { CompanyAccountOwnerPickerFieldEditMode } from './CompanyAccountOwnerPickerFieldEditMode';

type OwnProps = {
  company: Pick<Company, 'id' | 'accountOwnerId'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
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
          parentHotkeyScope={{
            scope: PageHotkeyScope.CompanyShowPage,
          }}
          iconLabel={<IconUserCircle />}
          editModeContent={
            <CompanyAccountOwnerPickerFieldEditMode
              parentHotkeyScope={{
                scope: PageHotkeyScope.CompanyShowPage,
              }}
              company={company}
            />
          }
          displayModeContent={
            company.accountOwner?.displayName ? (
              <PersonChip
                id={company.accountOwner.id}
                name={company.accountOwner?.displayName ?? ''}
              />
            ) : (
              <></>
            )
          }
        />
      </RecoilScope>
    </RecoilScope>
  );
}
