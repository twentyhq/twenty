import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { EditablePeopleFullName } from '@/people/components/EditablePeopleFullName';
import { peopleNameCellFamilyState } from '@/people/states/peopleNamesFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

import { GET_PERSON } from '../../queries';

export function EditablePeopleFullNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

  const { commentCount, firstName, lastName, displayName } = useRecoilValue(
    peopleNameCellFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <EditablePeopleFullName
      person={{
        id: currentRowEntityId ?? undefined,
        _activityCount: commentCount ?? undefined,
        firstName,
        lastName,
        displayName: displayName ?? undefined,
      }}
      onSubmit={(newFirstValue, newSecondValue) =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              firstName: newFirstValue,
              lastName: newSecondValue,
            },
          },
          refetchQueries: [getOperationName(GET_PERSON) ?? ''],
        })
      }
    />
  );
}
