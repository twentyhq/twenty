import { useSetRecoilState } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/Data/Field/states/entityFieldsFamilyState';
import { useGetPersonQuery } from '~/generated/graphql';

export const usePersonQuery = (id: string) => {
  const updatePersonShowPage = useSetRecoilState(entityFieldsFamilyState(id));

  return useGetPersonQuery({
    variables: { id },
    onCompleted: (data) => {
      updatePersonShowPage(data?.findUniquePerson);
    },
  });
};
