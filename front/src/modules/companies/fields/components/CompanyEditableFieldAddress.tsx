import { useEffect, useState } from 'react';
import { IconLink, IconMap } from '@tabler/icons-react';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldDisplayURL } from '@/ui/editable-fields/components/FieldDisplayURL';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-inputs/components/InplaceInputText';
import { Company } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'address'>;
};

export function CompanyEditableFieldAddress({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.address);

  useEffect(() => {
    setInternalValue(company.address);
  }, [company.address]);

  function handleChange(newValue: string) {
    setInternalValue(newValue);
    console.log({ newValue });
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={<IconMap />}
        label="Address"
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
        displayModeContent={internalValue}
      />
    </RecoilScope>
  );
}
