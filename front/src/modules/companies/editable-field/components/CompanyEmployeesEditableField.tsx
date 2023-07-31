import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconUsers } from '@/ui/icon';
import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Company, useUpdateOneCompanyMutation } from '~/generated/graphql';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

type OwnProps = {
  company: Pick<Company, 'id' | 'employees'>;
};

export function CompanyEmployeesEditableField({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(
    company.employees?.toString(),
  );

  const [updateCompany] = useUpdateOneCompanyMutation();

  useEffect(() => {
    setInternalValue(company.employees?.toString());
  }, [company.employees]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    if (!canBeCastAsIntegerOrNull(internalValue)) {
      handleCancel();
      return;
    }

    const valueCastedAsNumberOrNull = castAsIntegerOrNull(internalValue);

    await updateCompany({
      variables: {
        where: {
          id: company.id,
        },
        data: {
          employees: valueCastedAsNumberOrNull,
        },
      },
    });

    setInternalValue(valueCastedAsNumberOrNull?.toString());
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
          <TextInputEdit
            placeholder={'Employees'}
            autoFocus
            value={internalValue ?? ''}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={internalValue}
        isDisplayModeContentEmpty={!(internalValue && internalValue !== '0')}
      />
    </RecoilScope>
  );
}
