import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { useEditableCell } from '@/ui/components/editable-cell/hooks/useCloseEditableCell';
import { isCreateModeScopedState } from '@/ui/components/editable-cell/states/isCreateModeScopedState';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  Company,
  Person,
  useSearchCompanyQuery,
  useUpdatePeopleMutation,
} from '~/generated/graphql';

export type OwnProps = {
  people: Pick<Person, 'id'> & { company?: Pick<Company, 'id'> | null };
};

export function PeopleCompanyPicker({ people }: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updatePeople] = useUpdatePeopleMutation();

  const { closeEditableCell } = useEditableCell();

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
    await updatePeople({
      variables: {
        ...people,
        companyId: entity.id,
      },
    });

    closeEditableCell();
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
