import { useEffect, useState } from 'react';
import { IconLink } from '@tabler/icons-react';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldDisplayURL } from '@/ui/editable-fields/components/FieldDisplayURL';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-inputs/components/InplaceInputText';
import { Company } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'domainName'>;
};

export function CompanyEditableFieldURL({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.domainName);

  useEffect(() => {
    setInternalValue(company.domainName);
  }, [company.domainName]);

  function handleChange(newValue: string) {
    setInternalValue(newValue);
    console.log({ newValue });
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={<IconLink />}
        label="URL"
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
