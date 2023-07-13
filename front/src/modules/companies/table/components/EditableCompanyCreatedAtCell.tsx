import { DateTime } from 'luxon';
import { useRecoilValue } from 'recoil';

import { companyCreatedAtFamilyState } from '@/companies/states/companyCreatedAtFamilyState';
import { EditableCellDate } from '@/ui/components/editable-cell/types/EditableCellDate';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';
import { useUpdateCompanyMutation } from '~/generated/graphql';

export function EditableCompanyCreatedAtCell() {
  console.log('EditableCompanyCreatedAtCell');
  const currentRowEntityId = useCurrentRowEntityId();

  const createdAt = useRecoilValue(
    companyCreatedAtFamilyState(currentRowEntityId ?? ''),
  );

  const [updateCompany] = useUpdateCompanyMutation();

  return (
    <EditableCellDate
      onChange={async (newDate: Date) => {
        if (!currentRowEntityId) return;

        await updateCompany({
          variables: {
            id: currentRowEntityId,
            createdAt: newDate.toISOString(),
          },
        });
      }}
      value={createdAt ? DateTime.fromISO(createdAt).toJSDate() : new Date()}
    />
  );
}
