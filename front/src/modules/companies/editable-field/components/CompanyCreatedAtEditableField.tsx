import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { EditableFieldEditModeDate } from '@/ui/editable-field/variants/components/EditableFieldEditModeDate';
import { IconCalendar } from '@/ui/icon';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { Company, useUpdateOneCompanyMutation } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils';
import { parseDate } from '~/utils/date-utils';

type OwnProps = {
  company: Pick<Company, 'id' | 'createdAt'>;
};

export function CompanyCreatedAtEditableField({ company }: OwnProps) {
  const [internalValue, setInternalValue] = useState(company.createdAt);

  const [updateCompany] = useUpdateOneCompanyMutation();

  useEffect(() => {
    setInternalValue(company.createdAt);
  }, [company.createdAt]);

  // TODO: refactor change and submit
  async function handleChange(newValue: string) {
    setInternalValue(newValue);

    await updateCompany({
      variables: {
        where: {
          id: company.id,
        },
        data: {
          createdAt: newValue ?? '',
        },
      },
    });
  }

  async function handleSubmit() {
    await updateCompany({
      variables: {
        where: {
          id: company.id,
        },
        data: {
          createdAt: internalValue ?? '',
        },
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
        isDisplayModeContentEmpty={!(internalValue !== '')}
      />
    </RecoilScope>
  );
}
