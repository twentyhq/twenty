import { useEffect, useState } from 'react';
import { IconLink } from '@tabler/icons-react';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldDisplayURL } from '@/ui/editable-fields/components/FieldDisplayURL';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-inputs/components/InplaceInputText';
import { Company, useUpdateCompanyMutation } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'domainName'>;
};

export function CompanyDomainNameEditableField({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.domainName);

  const [updateCompany] = useUpdateCompanyMutation();

  useEffect(() => {
    setInternalValue(company.domainName);
  }, [company.domainName]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    await updateCompany({
      variables: {
        id: company.id,
        domainName: internalValue ?? '',
      },
    });
  }

  async function handleCancel() {
    setInternalValue(company.domainName);
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={<IconLink />}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        editModeContent={
          <InplaceInputText
            placeholder={'URL'}
            autoFocus
            value={internalValue}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={<FieldDisplayURL URL={internalValue} />}
        useEditButton
      />
    </RecoilScope>
  );
}
