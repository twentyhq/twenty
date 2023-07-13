import { PersonChip } from '@/people/components/PersonChip';
import { EditableCell } from '@/ui/components/editable-cell/EditableCell';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import { Company, User } from '~/generated/graphql';

import { CompanyAccountOwnerPicker } from './CompanyAccountOwnerPicker';

export type OwnProps = {
  company: Pick<Company, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
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
            picture={
              getImageAbsoluteURIOrBase64(company.accountOwner?.avatarUrl) ??
              undefined
            }
          />
        ) : (
          <></>
        )
      }
    />
  );
}
