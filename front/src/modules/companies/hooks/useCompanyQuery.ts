import { useSetRecoilState } from 'recoil';

import { genericEntitiesFamilyState } from '@/ui/editable-field/states/genericEntitiesFamilyState';
import { useGetCompanyQuery } from '~/generated/graphql';

export function useCompanyQuery(id: string) {
  const updateCompanyShowPage = useSetRecoilState(
    genericEntitiesFamilyState(id),
  );
  return useGetCompanyQuery({
    variables: { where: { id } },
    onCompleted: (data) => {
      updateCompanyShowPage(data?.findUniqueCompany);
    },
  });
}
