import { useRecoilValue } from 'recoil';

import { EditablePeopleFullName } from '@/people/components/EditablePeopleFullName';
import { peopleNameCellFamilyState } from '@/people/states/peopleNamesFamilyState';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleFullNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const { commentCount, firstName, lastName } = useRecoilValue(
    peopleNameCellFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditablePeopleFullName
      person={{
        id: currentRowEntityId ?? undefined,
        _commentThreadCount: commentCount ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
      }}
      onChange={async (firstName: string, lastName: string) => {
        if (!currentRowEntityId) return;

        await updatePerson({
          variables: {
            id: currentRowEntityId,
            firstName,
            lastName,
          },
        });
      }}
    />
  );
}
