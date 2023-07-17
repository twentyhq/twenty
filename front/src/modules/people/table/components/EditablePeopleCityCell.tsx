import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleCityFamilyState } from '@/people/states/peopleCityFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdatePeopleMutation } from '~/generated/graphql';

export function EditablePeopleCityCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdatePeopleMutation();

  const city = useRecoilValue(peopleCityFamilyState(currentRowEntityId ?? ''));

  const [internalValue, setInternalValue] = useState(city ?? '');

  useEffect(() => {
    setInternalValue(city ?? '');
  }, [city]);

  return (
    <EditableCellText
      value={internalValue}
      onChange={setInternalValue}
      onSubmit={() =>
        updatePerson({
          variables: {
            id: currentRowEntityId,
            city: internalValue,
          },
        })
      }
      onCancel={() => setInternalValue(city ?? '')}
    />
  );
}
