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

  return (
    <EditableCellURL
      url={linkedinUrl ?? ''}
      onSubmit={(newURL) =>
        updatePerson({
          variables: {
            where: {
              id: currentRowEntityId,
            },
            data: {
              linkedinUrl: newURL,
            },
          },
        })
      }
    />
  );
}
