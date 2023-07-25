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

  return (
    <EditableCellText
      value={email || ''}
      onSubmit={(newEmail: string) =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              email: newEmail,
            },
          },
        })
      }
    />
  );
}
