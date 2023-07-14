import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyDomainNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateCompanyMutation();

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
            id: currentRowEntityId,
            domainName: internalValue,
          },
        })
      }
      onCancel={() => setInternalValue(name ?? '')}
    />
  );
}
