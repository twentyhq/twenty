import { DateTime } from 'luxon';
import { useRecoilValue } from 'recoil';

import { peopleCreatedAtFamilyState } from '@/people/states/peopleCreatedAtFamilyState';
import { EditableCellDate } from '@/ui/table/editable-cell/types/EditableCellDate';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function EditablePeopleCreatedAtCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const createdAt = useRecoilValue(
    peopleCreatedAtFamilyState(currentRowEntityId ?? ''),
  );

  const [updatePerson] = useUpdateOnePersonMutation();

  return (
    <EditableCellDate
      onChange={async (newDate: Date) => {
        if (!currentRowEntityId) return;

        await updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              createdAt: newDate.toISOString(),
            },
          },
        });
      }}
      value={createdAt ? DateTime.fromISO(createdAt).toJSDate() : new Date()}
    />
  );
}
