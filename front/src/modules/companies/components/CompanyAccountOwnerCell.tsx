import { PersonChip } from '@/people/components/PersonChip';
import { EditableCellV2 } from '@/ui/components/editable-cell/EditableCellV2';
import { Company, User } from '~/generated/graphql';

import { CompanyAccountOwnerPicker } from './CompanyAccountOwnerPicker';

export type OwnProps = {
  company: Pick<Company, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
  };
};

export function CompanyAccountOwnerCell({ company }: OwnProps) {
  return (
    <EditableCellV2
      editModeContent={<CompanyAccountOwnerPicker company={company} />}
      nonEditModeContent={
        company.accountOwner?.displayName ? (
          <PersonChip name={company.accountOwner?.displayName ?? ''} />
        ) : (
          <></>
        )
      }
    />
  );
}
