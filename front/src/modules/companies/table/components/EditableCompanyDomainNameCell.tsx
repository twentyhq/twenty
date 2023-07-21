import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { EditableCellURL } from '../../../ui/table/editable-cell/types/EditableCellURL';

export function EditableCompanyDomainNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateOneCompanyMutation();

  const name = useRecoilValue(
    companyDomainNameFamilyState(currentRowEntityId ?? ''),
  );
  const [internalValue, setInternalValue] = useState(name ?? '');
  useEffect(() => {
    setInternalValue(name ?? '');
  }, [name]);

  return (
    <EditableCellURL
      url={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updateCompany({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              domainName: internalValue,
            },
          },
        })
      }
      onCancel={() => setInternalValue(name ?? '')}
    />
  );
}
