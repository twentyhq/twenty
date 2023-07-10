import { PersonChip } from '@/people/components/PersonChip';
import { EditableCell } from '@/ui/components/editable-cell/EditableCell';
import { Company, User } from '~/generated/graphql';

import { CompanyAccountOwnerPicker } from './CompanyAccountOwnerPicker';

export type OwnProps = {
  company: Pick<Company, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
  };
};

export function CompanyAccountOwnerCell({ company }: OwnProps) {
  return (
    <EditableCell
      editModeContent={<CompanyAccountOwnerPicker company={company} />}
      nonEditModeContent={
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
  );
}
