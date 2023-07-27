import { useRecoilValue } from 'recoil';

import { EditableCellText } from '@/ui/table/editable-cell/types/EditableCellText';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

export function EditablePeopleCityCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const [updatePerson] = useUpdateOnePersonMutation();

  const city = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: 'city',
    }),
  );

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
