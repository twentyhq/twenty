import { useRecoilValue } from 'recoil';

import { peopleEmailFamilyState } from '@/people/states/peopleEmailFamilyState';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleEmailCell() {
  console.log('EditablePeopleEmailCell');
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const email = useRecoilValue(
    peopleEmailFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditableCellText
      value={email ?? ''}
      onChange={async (newEmail: string) => {
        if (!currentRowEntityId) return;

        await updatePerson({
          variables: {
            id: currentRowEntityId,
            email: newEmail,
          },
        });
      }}
    />
  );
}
