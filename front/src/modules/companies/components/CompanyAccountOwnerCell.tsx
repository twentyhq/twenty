import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { Company, User } from '~/generated/graphql';

import { UserChip } from '../../users/components/UserChip';

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
      transparent
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
          <UserChip
            id={company.accountOwner.id}
            name={company.accountOwner?.displayName ?? ''}
            pictureUrl={company.accountOwner?.avatarUrl ?? ''}
          />
        ) : (
          <></>
        )
      }
    />
  );
}
