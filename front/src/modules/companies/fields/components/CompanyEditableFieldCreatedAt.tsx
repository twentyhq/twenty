import { useEffect, useState } from 'react';
import { IconCalendar } from '@tabler/icons-react';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EditableField } from '@/ui/editable-fields/components/EditableField';
import { FieldContext } from '@/ui/editable-fields/states/FieldContext';
import { EditableFieldEditModeDate } from '@/ui/editable-fields/variants/components/EditableFieldEditModeDate';
import { parseDate } from '@/utils/datetime/date-utils';
import { formatToHumanReadableDate } from '@/utils/utils';
import { Company, useUpdateCompanyMutation } from '~/generated/graphql';

type OwnProps = {
  company: Pick<Company, 'id' | 'createdAt'>;
};

export function CompanyEditableFieldCreatedAt({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.createdAt);

  const [updateCompany] = useUpdateCompanyMutation();

  useEffect(() => {
    setInternalValue(company.createdAt);
  }, [company.createdAt]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    await updateCompany({
      variables: {
        id: company.id,
        createdAt: internalValue ?? '',
      },
    });
  }

  async function handleCancel() {
    setInternalValue(company.createdAt);
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={<IconCalendar />}
        editModeContent={
          <EditableFieldEditModeDate
            value={internalValue}
            onChange={handleChange}
          />
        }
        displayModeContent={
          internalValue !== ''
            ? formatToHumanReadableDate(parseDate(internalValue).toJSDate())
            : 'No date'
        }
      />
    </RecoilScope>
  );
}
