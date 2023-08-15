import { useSetRecoilState } from 'recoil';

import { genericEntitiesFamilyState } from '@/ui/editable-field/states/genericEntitiesFamilyState';
import { useGetPersonQuery } from '~/generated/graphql';

export function usePersonQuery(id: string) {
  const updatePersonShowPage = useSetRecoilState(
    genericEntitiesFamilyState(id),
  );
  return useGetPersonQuery({
    variables: { id },
    onCompleted: (data) => {
      updatePersonShowPage(data?.findUniquePerson);
    },
  });
}
