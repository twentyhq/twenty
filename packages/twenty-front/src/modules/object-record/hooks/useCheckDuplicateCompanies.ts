import { useCallback } from 'react';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type CheckDuplicateCompaniesInput = {
  name?: string;
  domainName?: string;
};

const getMockDuplicateCompanies = ({
  domainName,
  name,
}: CheckDuplicateCompaniesInput): ObjectRecord[] => {
  if (!name && !domainName) {
    return [];
  }

  return [
    {
      id: 'duplicate-company-id',
      name: name ?? 'Potential duplicate company',
      domainName: domainName ?? 'example.com',
    } as ObjectRecord,
  ];
};

export const useCheckDuplicateCompanies = () => {
  const checkDuplicateCompanies = useCallback(
    async ({
      domainName,
      name,
    }: CheckDuplicateCompaniesInput): Promise<ObjectRecord[]> => {
      return getMockDuplicateCompanies({
        domainName,
        name,
      });
    },
    [],
  );

  return {
    checkDuplicateCompanies,
  };
};
