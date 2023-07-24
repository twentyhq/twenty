import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleCityFamilyState } from '@/people/states/peopleCityFamilyState';
import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function EditablePeopleCityCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

  const city = useRecoilValue(peopleCityFamilyState(currentRowEntityId ?? ''));

  return (
    <EditableCellText
      value={city ?? ''}
      onSubmit={(newText) =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              city: newText,
            },
          },
        })
      }
    />
  );
}
