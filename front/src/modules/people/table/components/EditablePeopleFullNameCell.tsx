import { useEffect, useState } from 'react';
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

  const [internalFirstName, setInternalFirstName] = useState(firstName ?? '');
  const [internalLastName, setInternalLastName] = useState(lastName ?? '');

  useEffect(() => {
    setInternalFirstName(firstName ?? '');
    setInternalLastName(lastName ?? '');
  }, [firstName, lastName]);

  return (
    <EditablePeopleFullName
      person={{
        id: currentRowEntityId ?? undefined,
        _commentThreadCount: commentCount ?? undefined,
        firstName: internalFirstName,
        lastName: internalLastName,
        displayName: displayName ?? undefined,
      }}
      onChange={(firstName, lastName) => {
        setInternalFirstName(firstName);
        setInternalLastName(lastName);
      }}
      onSubmit={() =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              firstName: internalFirstName,
              lastName: internalLastName,
            },
          },
          refetchQueries: [getOperationName(GET_PERSON) ?? ''],
        })
      }
      onCancel={() => {
        setInternalFirstName(firstName ?? '');
        setInternalLastName(lastName ?? '');
      }}
    />
  );
}
