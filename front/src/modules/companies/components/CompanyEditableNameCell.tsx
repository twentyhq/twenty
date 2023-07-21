import { useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';

import { EditableCellChip } from '@/ui/table/editable-cell/types/EditableChip';
import {
  GetCompaniesQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { GET_COMPANY } from '../queries';

import { CompanyChip } from './CompanyChip';

type OwnProps = {
  company: Pick<
    GetCompaniesQuery['companies'][0],
    'id' | 'name' | 'domainName' | '_commentThreadCount'
  >;
};

export function CompanyEditableNameChipCell({ company }: OwnProps) {
  const [updateCompany] = useUpdateOneCompanyMutation();

  const [internalValue, setInternalValue] = useState(company.name ?? '');

  useEffect(() => {
    setInternalValue(company.name ?? '');
  }, [company.name]);

  return (
    <EditableCellChip
      value={internalValue}
      placeholder="Name"
      changeHandler={setInternalValue}
      ChipComponent={
        <CompanyChip
          id={company.id}
          name={company.name}
          clickable
          picture={getLogoUrlFromDomainName(company.domainName)}
        />
      }
      onSubmit={() =>
        updateCompany({
          variables: {
            where: { id: company.id },
            data: {
              name: internalValue,
            },
          },
          refetchQueries: [getOperationName(GET_COMPANY) ?? ''],
        })
      }
      onCancel={() => setInternalValue(company.name ?? '')}
    />
  );
}
