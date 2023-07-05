import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { v4 as uuidv4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/services';
import { useInsertCompanyMutation } from '~/generated/graphql';

export function useCreateCompany() {
  const [insertCompany] = useInsertCompanyMutation();

  const createCompany = useCallback(async () => {
    const newCompany = {
      id: uuidv4(),
      name: '',
      domainName: '',
      employees: null,
      address: '',
      createdAt: new Date().toISOString(),
    };

    await insertCompany({
      variables: newCompany,
      refetchQueries: [getOperationName(GET_COMPANIES) ?? ''],
    });
  }, [insertCompany]);

  return createCompany;
}
