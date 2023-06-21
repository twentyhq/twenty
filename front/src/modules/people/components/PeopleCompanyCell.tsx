import CompanyChip from '@/companies/components/CompanyChip';
import { EditableCellV2 } from '@/ui/components/editable-cell/EditableCellV2';
import { isCreateModeScopedState } from '@/ui/components/editable-cell/states/isCreateModeScopedState';
import { useRecoilScopedState } from '@/ui/hooks/useRecoilScopedState';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { Company, Person } from '~/generated/graphql';

import { PeopleCompanyCreateCell } from './PeopleCompanyCreateCell';
import { PeopleCompanyPicker } from './PeopleCompanyPicker';

export type OwnProps = {
  people: Pick<Person, 'id'> & {
    company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
  };
};

export function PeopleCompanyCell({ people }: OwnProps) {
  const [isCreating] = useRecoilScopedState(isCreateModeScopedState);

  return isCreating ? (
    <PeopleCompanyCreateCell people={people} />
  ) : (
    <EditableCellV2
      editModeContent={<PeopleCompanyPicker people={people} />}
      nonEditModeContent={
        <CompanyChip
          name={people.company?.name ?? ''}
          picture={getLogoUrlFromDomainName(people.company?.domainName)}
        />
      }
    />
  );
}
