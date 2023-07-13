import { useRecoilValue } from 'recoil';

import { PeopleCompanyCell } from '@/people/components/PeopleCompanyCell';
import { peopleCompanyFamilyState } from '@/people/states/peopleCompanyFamilyState';
import { useCurrentRowEntityId } from '@/ui/tables/hooks/useCurrentEntityId';

export function EditablePeopleCompanyCell() {
  const currentRowEntityId = useCurrentRowEntityId();

  const company = useRecoilValue(
    peopleCompanyFamilyState(currentRowEntityId ?? ''),
  );

  return (
    <PeopleCompanyCell
      people={{
        id: currentRowEntityId ?? '',
        company: {
          domainName: company?.domainName ?? '',
          name: company?.name ?? '',
          id: company?.id ?? '',
        },
      }}
    />
  );
}
