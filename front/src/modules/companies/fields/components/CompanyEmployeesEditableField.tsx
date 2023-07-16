import { useEffect, useState } from 'react';
import { IconUsers } from '@tabler/icons-react';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-inputs/components/InplaceInputText';
import { Company, useUpdateCompanyMutation } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'employees'>;
};

export function CompanyEmployeesEditableField({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(
    company.employees?.toString(),
  );

  const [updateCompany] = useUpdateCompanyMutation();

  useEffect(() => {
    setInternalValue(company.employees?.toString());
  }, [company.employees]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    if (!internalValue) return;

    try {
      const numberValue = parseInt(internalValue);

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      await updateCompany({
        variables: {
          id: company.id,
          employees: numberValue,
        },
      });

      setInternalValue(numberValue.toString());
    } catch {
      handleCancel();
    }
  }

  async function handleCancel() {
    setInternalValue(company.employees?.toString());
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={<IconUsers />}
        editModeContent={
          <InplaceInputText
            placeholder={'Employees'}
            autoFocus
            value={internalValue ?? ''}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={internalValue}
      />
    </RecoilScope>
  );
}
