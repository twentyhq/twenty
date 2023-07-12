import { CompanyChip } from '@/companies/components/CompanyChip';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { EditableCell } from '@/ui/components/editable-cell/EditableCell';
import { isCreateModeScopedState } from '@/ui/components/editable-cell/states/isCreateModeScopedState';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { Company, Person } from '~/generated/graphql';

import { PeopleCompanyCreateCell } from './PeopleCompanyCreateCell';
import { PeopleCompanyPicker } from './PeopleCompanyPicker';

export type PeopleWithCompany = Pick<Person, 'id'> & {
  company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
};

export type OwnProps = {
  people: Pick<Person, 'id'> & {
    company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
  };
};

export function PeopleCompanyCell({ people }: OwnProps) {
  const [isCreating] = useRecoilScopedState(isCreateModeScopedState);

  return (
    <EditableCell
      editHotkeysScope={{ scope: InternalHotkeysScope.RelationPicker }}
      editModeContent={
        isCreating ? (
          <PeopleCompanyCreateCell people={people} />
        ) : (
          <PeopleCompanyPicker people={people} />
        )
      }
      nonEditModeContent={
        <CompanyChip
          id={people.company?.id ?? ''}
          name={people.company?.name ?? ''}
          picture={getLogoUrlFromDomainName(people.company?.domainName)}
        />
      }
    />
  );
}
