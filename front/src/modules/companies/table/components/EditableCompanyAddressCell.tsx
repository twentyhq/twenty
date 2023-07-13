import { useRecoilValue } from 'recoil';

import { companyAddressFamilyState } from '@/companies/states/companyAddressFamilyState';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyAddressCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateCompanyMutation();

  const address = useRecoilValue(
    companyAddressFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditableCellText
      value={address ?? ''}
      onChange={async (newAddress: string) => {
        if (!currentRowEntityId) return;

        await updateCompany({
          variables: {
            id: currentRowEntityId,
            address: newAddress,
          },
        });
      }}
    />
  );
}
