import { useRecoilValue } from 'recoil';

import { peoplePhoneFamilyState } from '@/people/states/peoplePhoneFamilyState';
import { EditableCellPhone } from '@/ui/components/editable-cell/types/EditableCellPhone';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeoplePhoneCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const phone = useRecoilValue(
    peoplePhoneFamilyState(currentRowEntityId ?? ''),
  );
  return (
    <EditableCellPhone
      value={phone ?? ''}
      onChange={async (newPhone: string) => {
        if (!currentRowEntityId) return;

        await updatePerson({
          variables: {
            id: currentRowEntityId,
            phone: newPhone,
          },
        });
      }}
    />
  );
}
