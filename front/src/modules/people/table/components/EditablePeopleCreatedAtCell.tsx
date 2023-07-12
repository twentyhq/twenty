import { DateTime } from 'luxon';
import { useRecoilValue } from 'recoil';

import { peopleCreatedAtFamilyState } from '@/people/states/peopleCreatedAtFamilyState';
import { EditableCellDate } from '@/ui/components/editable-cell/types/EditableCellDate';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleCreatedAtCell() {
  console.log('EditablePeopleCreatedAtCell');
  const currentRowEntityId = useCurrentRowEntityId();

  const createdAt = useRecoilValue(
    peopleCreatedAtFamilyState(currentRowEntityId ?? ''),
  );

  const [updatePerson] = useUpdatePeopleMutation();

  return (
    <EditableCellDate
      onChange={async (newDate: Date) => {
        if (!currentRowEntityId) return;

        await updatePerson({
          variables: {
            id: currentRowEntityId,
            createdAt: newDate.toISOString(),
          },
        });
      }}
      value={createdAt ? DateTime.fromISO(createdAt).toJSDate() : new Date()}
    />
  );
}
