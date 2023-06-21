import { useRecoilState } from 'recoil';

import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { isCreateModeScopedState } from '@/ui/components/editable-cell/states/isCreateModeScopedState';
import { useRecoilScopedState } from '@/ui/hooks/useRecoilScopedState';
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  useSearchCompanyQuery,
  useUpdatePeopleMutation,
} from '~/generated/graphql';

import { Person } from '../interfaces/person.interface';

export type OwnProps = {
  people: Person;
};

export function PeopleCompanyPicker({ people }: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updatePeople] = useUpdatePeopleMutation();
  const [, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );

  const companies = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    selectedIds: [people.company?.id ?? ''],
    searchFilter: searchFilter,
    mappingFunction: (company) => ({
      entityType: CommentableType.Company,
      id: company.id,
      name: company.name,
      avatarType: 'squared',
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
    }),
    orderByField: 'name',
    searchOnFields: ['name'],
  });

  async function handleEntitySelected(entity: any) {
    setIsSomeInputInEditMode(false);

    await updatePeople({
      variables: {
        ...people,
        companyId: entity.id,
      },
    });
  }

  function handleCreate() {
    setIsCreating(true);
  }

  return (
    <SingleEntitySelect
      onCreate={handleCreate}
      onEntitySelected={handleEntitySelected}
      entities={{
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
      }}
    />
  );
}
