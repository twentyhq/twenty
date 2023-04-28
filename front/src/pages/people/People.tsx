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
import { useCallback, useEffect, useState } from 'react';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  reduceSortsToOrderBy,
  usePeopleQuery,
} from '../../services/people';
import { People_Bool_Exp } from '../../generated/graphql';
import { useLazySearch } from '../../services/search/search';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function People() {
  const [, setSorts] = useState([] as Array<PeopleSelectedSortType>);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [filterSearchResults, setFilterSearchResults] = useState([
    'Toto',
    'Lala',
  ] as Array<string>);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setSorts(sorts);
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const [lazySearch, { data: lazySearchData }] = useLazySearch();

  useEffect(() => {
    if (lazySearchData) {
      setFilterSearchResults(
        lazySearchData.people.map((person: any) => person.firstname),
      );
    }
  }, [lazySearchData]);

  const filterSearch = useCallback(
    (filterKey: string, filterValue: string) => {
      console.log('filterSearch', filterKey, filterValue);
      lazySearch({
        [filterKey]: { _ilike: `%${filterValue}%` },
      });
    },
    [lazySearch],
  );

  const { data } = usePeopleQuery(orderBy);

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
            onFilterSearch={filterSearch}
          />
        }
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
