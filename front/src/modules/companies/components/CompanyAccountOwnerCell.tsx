import { PersonChip } from '@/people/components/PersonChip';
import { RelationPickerHotkeyScope } from '@/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/components/editable-cell/EditableCell';
import { useEditableCell } from '@/ui/components/editable-cell/hooks/useEditableCell';
import { Company, User } from '~/generated/graphql';

import { CompanyAccountOwnerPicker } from './CompanyAccountOwnerPicker';

export type CompanyAccountOnwer = Pick<Company, 'id'> & {
  accountOwner?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
};

export type OwnProps = {
  company: CompanyAccountOnwer;
};

export function CompanyAccountOwnerCell({ company }: OwnProps) {
  const { closeEditableCell } = useEditableCell();

  function handleCancel() {
    closeEditableCell();
  }

  function handleSubmit() {
    closeEditableCell();
  }

  return (
    <EditableCell
      editHotkeyScope={{ scope: RelationPickerHotkeyScope.RelationPicker }}
      editModeContent={
        <CompanyAccountOwnerPicker
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          company={company}
        />
      }
      nonEditModeContent={
        company.accountOwner?.displayName ? (
          <PersonChip
            id={company.accountOwner.id}
            name={company.accountOwner?.displayName ?? ''}
            picture={company.accountOwner?.avatarUrl ?? ''}
          />
        ) : (
          <></>
        )
      }
    />
  );
}
