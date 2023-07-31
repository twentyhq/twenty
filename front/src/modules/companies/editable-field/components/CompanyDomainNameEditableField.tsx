import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldDisplayURL } from '@/ui/editable-field/components/FieldDisplayURL';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconLink } from '@/ui/icon';
import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { Company, useUpdateOneCompanyMutation } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'domainName'>;
};

export function CompanyDomainNameEditableField({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.domainName);

  const [updateCompany] = useUpdateOneCompanyMutation();

  useEffect(() => {
    setInternalValue(company.domainName);
  }, [company.domainName]);

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
          domainName: internalValue ?? '',
        },
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
          <TextInputEdit
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
        isDisplayModeContentEmpty={!(internalValue !== '')}
      />
    </RecoilScope>
  );
}
