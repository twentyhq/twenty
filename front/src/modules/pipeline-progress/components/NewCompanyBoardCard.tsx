import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  Company,
  useSearchCompanyQuery,
} from '~/generated/graphql';

type OwnProps = {
  onEntitySelect: (
    company: Pick<Company, 'id' | 'name' | 'domainName'>,
  ) => void;
};

export function NewCompanyBoardCard({ onEntitySelect }: OwnProps) {
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const companies = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    selectedIds: [],
    searchFilter: searchFilter,
    mappingFunction: (company) => ({
      entityType: CommentableType.Company,
      id: company.id,
      name: company.name,
      domainName: company.domainName,
      avatarType: 'squared',
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
    }),
    orderByField: 'name',
    searchOnFields: ['name'],
  });

  return (
    <SingleEntitySelect
      onEntitySelected={(value) => onEntitySelect(value)}
      entities={{
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
        loading: companies.loading,
      }}
    />
  );
}
