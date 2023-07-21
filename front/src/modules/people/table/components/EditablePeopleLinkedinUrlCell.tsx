import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleLinkedinUrlFamilyState } from '@/people/states/peopleLinkedinUrlFamilyState';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

import { EditableCellURL } from '../../../ui/table/editable-cell/types/EditableCellURL';

export function EditablePeopleLinkedinUrlCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

  const linkedinUrl = useRecoilValue(
    peopleLinkedinUrlFamilyState(currentRowEntityId ?? ''),
  );

  const [internalValue, setInternalValue] = useState(linkedinUrl ?? '');

  useEffect(() => {
    setInternalValue(linkedinUrl ?? '');
  }, [linkedinUrl]);

  return (
    <EditableCellURL
      url={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              linkedinUrl: internalValue,
            },
          },
        })
      }
      onCancel={() => setInternalValue(linkedinUrl ?? '')}
    />
  );
}
