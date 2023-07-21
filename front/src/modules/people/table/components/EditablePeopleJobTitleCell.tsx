import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleJobTitleFamilyState } from '@/people/states/peopleJobTitleFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function EditablePeopleJobTitleCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

  const jobTitle = useRecoilValue(
    peopleJobTitleFamilyState(currentRowEntityId ?? ''),
  );

  const [internalValue, setInternalValue] = useState(jobTitle ?? '');

  useEffect(() => {
    setInternalValue(jobTitle ?? '');
  }, [jobTitle]);

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
              jobTitle: internalValue,
            },
          },
        })
      }
      onCancel={() => setInternalValue(jobTitle ?? '')}
    />
  );
}
