import { useEffect, useState } from 'react';
import { IconMap } from '@tabler/icons-react';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-inputs/components/InplaceInputText';
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
