import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

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
    <EditableCellText
      value={internalValue}
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
