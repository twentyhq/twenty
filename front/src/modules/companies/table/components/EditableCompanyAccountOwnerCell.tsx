import { useRecoilValue } from 'recoil';

import { CompanyAccountOwnerCell } from '@/companies/components/CompanyAccountOwnerCell';
import { companyAccountOwnerFamilyState } from '@/companies/states/companyAccountOwnerFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

export function EditableCompanyAccountOwnerCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const accountOwner = useRecoilValue(
    companyAccountOwnerFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <CompanyAccountOwnerCell
      company={{
        id: currentRowEntityId ?? '',
        accountOwner: {
          avatarUrl: accountOwner?.avatarUrl ?? '',
          displayName: accountOwner?.displayName ?? '',
          id: accountOwner?.id ?? '',
        },
      }}
    />
  );
}
