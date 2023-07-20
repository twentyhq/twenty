import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peoplePhoneFamilyState } from '@/people/states/peoplePhoneFamilyState';
import { EditableCellPhone } from '@/ui/table/editable-cell/types/EditableCellPhone';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function EditablePeoplePhoneCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

  const phone = useRecoilValue(
    peoplePhoneFamilyState(currentRowEntityId ?? ''),
  );

  const [internalValue, setInternalValue] = useState(phone ?? '');

  useEffect(() => {
    setInternalValue(phone ?? '');
  }, [phone]);

  return (
    <EditableCellPhone
      value={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              phone: internalValue,
            },
          },
        })
      }
      onCancel={() => setInternalValue(phone ?? '')}
    />
  );
}
