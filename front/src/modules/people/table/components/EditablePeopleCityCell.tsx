import { useRecoilValue } from 'recoil';

import { peopleCityFamilyState } from '@/people/states/peopleCityFamilyState';
import { EditableCellPhone } from '@/ui/components/editable-cell/types/EditableCellPhone';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleCityCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const city = useRecoilValue(peopleCityFamilyState(currentRowEntityId ?? ''));

  return (
    <EditableCellPhone
      value={city ?? ''}
      onChange={async (newCity: string) => {
        if (!currentRowEntityId) return;

        await updatePerson({
          variables: {
            id: currentRowEntityId,
            city: newCity,
          },
        });
      }}
    />
  );
}
