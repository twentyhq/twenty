import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleEmailFamilyState } from '@/people/states/peopleEmailFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function EditablePeopleEmailCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

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
            where: {
              id: currentRowEntityId,
            },
            data: {
              email: internalValue,
            },
          },
        })
      }
      onCancel={() => setInternalValue(email ?? '')}
    />
  );
}
