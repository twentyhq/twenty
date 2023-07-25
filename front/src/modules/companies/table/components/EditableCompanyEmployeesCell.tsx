import { useRecoilValue } from 'recoil';

import { companyEmployeesFamilyState } from '@/companies/states/companyEmployeesFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

export function EditableCompanyEmployeesCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateOneCompanyMutation();

  const employees = useRecoilValue(
    companyEmployeesFamilyState(currentRowEntityId ?? ''),
  );

  return (
    // TODO: Create an EditableCellNumber component
    <EditableCellText
      value={employees || ''}
      onSubmit={(newValue) =>
        updateCompany({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              employees: parseInt(newValue),
            },
          },
        })
      }
    />
  );
}
