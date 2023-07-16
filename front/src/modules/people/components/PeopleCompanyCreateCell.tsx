import { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/queries';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { isCreateModeScopedState } from '@/ui/components/editable-cell/states/isCreateModeScopedState';
import { EditableCellDoubleTextEditMode } from '@/ui/components/editable-cell/types/EditableCellDoubleTextEditMode';
import { logError } from '@/utils/logs/logError';
import {
  Person,
  useInsertCompanyMutation,
  useUpdatePeopleMutation,
} from '~/generated/graphql';

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
  const [insertCompany] = useInsertCompanyMutation();
  const [updatePeople] = useUpdatePeopleMutation();

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
          id: newCompanyId,
          name: companyName,
          domainName: companyDomainName,
          address: '',
          createdAt: new Date().toISOString(),
        },
        refetchQueries: [getOperationName(GET_COMPANIES) || ''],
      });

      await updatePeople({
        variables: {
          ...people,
          companyId: newCompanyId,
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
