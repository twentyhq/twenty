import { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/queries';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { relationPickerSearchFilterScopedState } from '@/ui/relation-picker/states/relationPickerSearchFilterScopedState';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import { EditableCellDoubleTextEditMode } from '@/ui/table/editable-cell/types/EditableCellDoubleTextEditMode';
import {
  Person,
  useInsertOneCompanyMutation,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

import { SEARCH_COMPANY_QUERY } from '../../search/queries/search';

type OwnProps = {
  people: Pick<Person, 'id'>;
};

export function PeopleCompanyCreateCell({ people }: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [currentSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const [companyName, setCompanyName] = useState(currentSearchFilter);

  const [companyDomainName, setCompanyDomainName] = useState('');
  const [insertCompany] = useInsertOneCompanyMutation();
  const [updatePerson] = useUpdateOnePersonMutation();

  function handleDoubleTextChange(leftValue: string, rightValue: string): void {
    setCompanyDomainName(leftValue);
    setCompanyName(rightValue);
  }

  async function handleCompanyCreate(
    companyName: string,
    companyDomainName: string,
  ) {
    const newCompanyId = v4();

    try {
      await insertCompany({
        variables: {
          data: {
            id: newCompanyId,
            name: companyName,
            domainName: companyDomainName,
            address: '',
          },
        },
        refetchQueries: [
          getOperationName(GET_COMPANIES) ?? '',
          getOperationName(SEARCH_COMPANY_QUERY) ?? '',
        ],
      });

      await updatePerson({
        variables: {
          where: {
            id: people.id,
          },
          data: {
            company: { connect: { id: newCompanyId } },
          },
        },
      });
    } catch (error) {
      // TODO: handle error better
      logError(error);
    }
    setIsCreating(false);
  }

  return (
    <EditableCellDoubleTextEditMode
      firstValue={companyDomainName}
      secondValue={companyName}
      firstValuePlaceholder="URL"
      secondValuePlaceholder="Name"
      onChange={handleDoubleTextChange}
      onSubmit={() => handleCompanyCreate(companyName, companyDomainName)}
      onCancel={() => setIsCreating(false)}
    />
  );
}
