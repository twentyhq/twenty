import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleEmailFamilyState } from '@/people/states/peopleEmailFamilyState';
import { EditableCellText } from '@/ui/components/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleEmailCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const email = useRecoilValue(
    peopleEmailFamilyState(currentRowEntityId ?? ''),
  );

  const [internalValue, setInternalValue] = useState(email ?? '');

  useEffect(() => {
    setInternalValue(email ?? '');
  }, [email]);

  return (
    <EditableCellText
      value={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updatePerson({
          variables: {
            id: currentRowEntityId,
            email: internalValue,
          },
        })
      }
      onCancel={() => setInternalValue(email ?? '')}
    />
  );
}
