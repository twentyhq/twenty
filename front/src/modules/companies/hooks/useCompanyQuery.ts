import { useSetRecoilState } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/field/states/entityFieldsFamilyState';
import { useGetCompanyQuery } from '~/generated/graphql';

export const useCompanyQuery = (id: string) => {
  const updateCompanyShowPage = useSetRecoilState(entityFieldsFamilyState(id));

  return useGetCompanyQuery({
    variables: { where: { id } },
    onCompleted: (data) => {
      updateCompanyShowPage(data?.findUniqueCompany);
    },
  });
};
