import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconMap } from '@/ui/icon';
import { InplaceInputText } from '@/ui/inplace-input/components/InplaceInputText';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { Company, useUpdateCompanyMutation } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'address'>;
};

export function CompanyEditableFieldAddress({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.address);

  const [updateCompany] = useUpdateCompanyMutation();

  useEffect(() => {
    setInternalValue(company.address);
  }, [company.address]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    await updateCompany({
      variables: {
        id: company.id,
        address: internalValue ?? '',
      },
    });
  }

  async function handleCancel() {
    setInternalValue(company.address);
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={<IconMap />}
        editModeContent={
          <InplaceInputText
            placeholder={'Address'}
            autoFocus
            value={internalValue}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={internalValue !== '' ? internalValue : 'No address'}
      />
    </RecoilScope>
  );
}
