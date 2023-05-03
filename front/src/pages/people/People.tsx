import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import {
  availableFilters,
  peopleColumns,
  availableSorts,
} from './people-table';
import { mapPerson } from '../../interfaces/person.interface';
import { useCallback, useState } from 'react';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
  usePeopleQuery,
} from '../../services/people';
import { useSearch } from '../../services/search/search';
import { People_Bool_Exp } from '../../generated/graphql';
import { SelectedFilterType } from '../../components/table/table-header/interface';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function People() {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [where, setWhere] = useState<People_Bool_Exp>({});
  const [filterSearchResults, setSearhInput, setFilterSearch] = useSearch();

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<People_Bool_Exp>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data } = usePeopleQuery(orderBy, where);

  return (
    <WithTopBarContainer title="People" icon={faUser}>
      <StyledPeopleContainer>
        {
          <Table
            data={data ? data.people.map(mapPerson) : []}
            columns={peopleColumns}
            viewName="All People"
            viewIcon={faList}
            availableSorts={availableSorts}
            availableFilters={availableFilters}
            filterSearchResults={filterSearchResults}
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
            onFilterSearch={(filter, searchValue) => {
              setSearhInput(searchValue);
              setFilterSearch(filter);
            }}
          />
        }
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
