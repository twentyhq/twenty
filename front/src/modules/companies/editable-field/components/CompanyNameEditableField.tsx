import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-input/components/InplaceInputText';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { Company, useUpdateOneCompanyMutation } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'name'>;
};

export function CompanyNameEditableField({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.name);

  const [updateCompany] = useUpdateOneCompanyMutation();

  useEffect(() => {
    setInternalValue(company.name);
  }, [company.name]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    await updateCompany({
      variables: {
        where: {
          id: company.id,
        },
        data: {
          name: internalValue ?? '',
        },
      },
    });
  }

  async function handleCancel() {
    setInternalValue(company.name);
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        editModeContent={
          <InplaceInputText
            placeholder={'Name'}
            autoFocus
            value={internalValue}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
            isTitle
          />
        }
        displayModeContent={internalValue ?? ''}
        isDisplayModeContentEmpty={!(internalValue !== '')}
      />
    </RecoilScope>
  );
}
