import { CompanyChip } from '@/companies/components/CompanyChip';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import { Company, Person } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

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
      transparent
      maxContentWidth={160}
      editHotkeyScope={{ scope: RelationPickerHotkeyScope.RelationPicker }}
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
          pictureUrl={getLogoUrlFromDomainName(people.company?.domainName)}
        />
      }
    />
  );
}
