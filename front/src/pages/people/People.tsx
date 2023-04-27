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

  const {
    data: filterSearchResultsQueryData,
    refetch: filterSearchResultQueryRefetch,
  } = usePeopleQuery({}, orderBy, 5);

  useEffect(() => {
    if (filterSearchResultsQueryData) {
      setFilterSearchResults(
        filterSearchResultsQueryData.people.map((person) => person.firstname),
      );
    }
  }, [filterSearchResultsQueryData]);

  const filterSearch = useCallback(
    (filterKey: string, filterValue: string) => {
      console.log('filterSearch', filterKey, filterValue);
      filterSearchResultQueryRefetch({
        where: {
          [filterKey]: { _ilike: `%${filterValue}%` },
        },
      });
    },
    [filterSearchResultQueryRefetch],
  );

  const { data } = usePeopleQuery({}, orderBy, 100);

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
