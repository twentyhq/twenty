import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { Entity } from '@/relation-picker/types/EntityTypeForSelect';
import { useEditableCell } from '@/ui/components/editable-cell/hooks/useEditableCell';
import {
  Company,
  User,
  useSearchUserQuery,
  useUpdateCompanyMutation,
} from '~/generated/graphql';

export type OwnProps = {
  company: Pick<Company, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
  };
};

type UserForSelect = EntityForSelect & {
  entityType: Entity.User;
};

export function CompanyAccountOwnerPicker({ company }: OwnProps) {
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updateCompany] = useUpdateCompanyMutation();

  const { closeEditableCell } = useEditableCell();

  const companies = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    selectedIds: [company?.accountOwner?.id ?? ''],
    searchFilter: searchFilter,
    mappingFunction: (user) => ({
      entityType: Entity.User,
      id: user.id,
      name: user.displayName,
      avatarType: 'rounded',
    }),
    orderByField: 'firstName',
    searchOnFields: ['firstName', 'lastName'],
  });

  async function handleEntitySelected(selectedUser: UserForSelect) {
    await updateCompany({
      variables: {
        ...company,
        accountOwnerId: selectedUser.id,
      },
    });

    closeEditableCell();
  }

  return (
    <SingleEntitySelect
      onEntitySelected={handleEntitySelected}
      entities={{
        loading: companies.loading,
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
      }}
    />
  );
}
