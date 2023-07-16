import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { companyAddressFamilyState } from '@/companies/states/companyAddressFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyAddressCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateCompanyMutation();

  const address = useRecoilValue(
    companyAddressFamilyState(currentRowEntityId ?? ''),
  );

  const [internalValue, setInternalValue] = useState(address ?? '');
  useEffect(() => {
    setInternalValue(address ?? '');
  }, [address]);

  return (
    <EditableCellText
      value={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updateCompany({
          variables: {
            id: currentRowEntityId,
            address: internalValue,
          },
        })
      }
      onCancel={() => setInternalValue(address ?? '')}
    />
  );
}
