import { useRecoilValue } from 'recoil';

import { companyEmployeesFamilyState } from '@/companies/states/companyEmployeesFamilyState';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyEmployeesCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateCompanyMutation();

  const employees = useRecoilValue(
    companyEmployeesFamilyState(currentRowEntityId ?? ''),
  );

  return (
    // TODO: Create an EditableCellNumber component
    <EditableCellText
      value={employees ?? ''}
      onChange={async (newEmployees: string) => {
        if (!currentRowEntityId) return;

        await updateCompany({
          variables: {
            id: currentRowEntityId,
            employees: parseInt(newEmployees),
          },
        });
      }}
    />
  );
}
