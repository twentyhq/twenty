import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { companyEmployeesFamilyState } from '@/companies/states/companyEmployeesFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyEmployeesCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updateCompany] = useUpdateCompanyMutation();

  const employees = useRecoilValue(
    companyEmployeesFamilyState(currentRowEntityId ?? ''),
  );

  const [internalValue, setInternalValue] = useState(employees ?? '');

  useEffect(() => {
    setInternalValue(employees ?? '');
  }, [employees]);

  return (
    // TODO: Create an EditableCellNumber component
    <EditableCellText
      value={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updateCompany({
          variables: {
            id: currentRowEntityId,
            employees: parseInt(internalValue),
          },
        })
      }
      onCancel={() => setInternalValue(employees ?? '')}
    />
  );
}
