import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peoplePhoneFamilyState } from '@/people/states/peoplePhoneFamilyState';
import { EditableCellPhone } from '@/ui/table/editable-cell/types/EditableCellPhone';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeoplePhoneCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

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
            id: currentRowEntityId,
            phone: internalValue,
          },
        })
      }
      onCancel={() => setInternalValue(phone ?? '')}
    />
  );
}
