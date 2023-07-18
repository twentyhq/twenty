import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { EditableFieldEditModeDate } from '@/ui/editable-field/components/EditableFieldEditModeDate';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconCalendar } from '@/ui/icon';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { Company, useUpdateCompanyMutation } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils';
import { parseDate } from '~/utils/date-utils';

type OwnProps = {
  company: Pick<Company, 'id' | 'createdAt'>;
};

export function CompanyCreatedAtEditableField({ company }: OwnProps) {
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
