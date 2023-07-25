import { useRecoilValue } from 'recoil';

import { companyAddressFamilyState } from '@/companies/states/companyAddressFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

export function EditableCompanyAddressCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateOneCompanyMutation();

  const address = useRecoilValue(
    companyAddressFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditableCellText
      value={address || ''}
      onSubmit={(newAddress) =>
        updateCompany({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              address: newAddress,
            },
          },
        })
      }
    />
  );
}
