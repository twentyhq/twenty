import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { EditablePeopleFullName } from '@/people/components/EditablePeopleFullName';
import { peopleNameCellFamilyState } from '@/people/states/peopleNamesFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleFullNameCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const { commentCount, firstName, lastName } = useRecoilValue(
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
      }}
      onChange={(firstName, lastName) => {
        setInternalFirstName(firstName);
        setInternalLastName(lastName);
      }}
      onSubmit={() =>
        updatePerson({
          variables: {
            id: currentRowEntityId,
            firstName: internalFirstName,
            lastName: internalLastName,
          },
        })
      }
      onCancel={() => {
        setInternalFirstName(firstName ?? '');
        setInternalLastName(lastName ?? '');
      }}
    />
  );
}
