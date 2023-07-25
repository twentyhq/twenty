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

  return (
    <EditableCellChip
      value={company.name}
      placeholder="Name"
      ChipComponent={
        <CompanyChip
          id={company.id}
          name={company.name}
          pictureUrl={getLogoUrlFromDomainName(company.domainName)}
        />
      }
      onSubmit={(newName) =>
        updateCompany({
          variables: {
            where: { id: company.id },
            data: {
              name: newName,
            },
          },
          refetchQueries: [getOperationName(GET_COMPANY) ?? ''],
        })
      }
    />
  );
}
