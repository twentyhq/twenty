import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldDisplayURL } from '@/ui/editable-field/components/FieldDisplayURL';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconLink } from '@/ui/icon';
import { InplaceInputText } from '@/ui/inplace-input/components/InplaceInputText';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
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
