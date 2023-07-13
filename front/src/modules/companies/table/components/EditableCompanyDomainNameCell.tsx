import { useRecoilValue } from 'recoil';

import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { companyNameFamilyState } from '@/companies/states/companyNameFamilyState';
import { peopleCityFamilyState } from '@/people/states/peopleCityFamilyState';
import { EditableCellPhone } from '@/ui/components/editable-cell/types/EditableCellPhone';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyDomainNameCell() {
  console.log('EditableCompanyDomainNameCell');
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateCompanyMutation();

  const name = useRecoilValue(
    companyDomainNameFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditableCellText
      value={name ?? ''}
      onChange={async (domainName: string) => {
        if (!currentRowEntityId) return;

        await updateCompany({
          variables: {
            id: currentRowEntityId,
            domainName: domainName,
          },
        });
      }}
    />
  );
}
