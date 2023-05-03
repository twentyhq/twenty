import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import {
  availableFilters,
  peopleColumns,
  availableSorts,
} from './people-table';
import {
  GraphqlQueryPerson,
  Person,
  mapPerson,
} from '../../interfaces/person.interface';
import { useCallback, useMemo, useState } from 'react';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  reduceSortsToOrderBy,
  usePeopleQuery,
} from '../../services/people';
import { SEARCH_QUERY, parseWhereQuery } from '../../services/search/search';
import { FilterType } from '../../components/table/table-header/interface';
import { useQuery } from '@apollo/client';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function People() {
  const [, setSorts] = useState([] as Array<PeopleSelectedSortType>);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [filterSearchParams, setFilterSearchParams] = useState<{
    filter: FilterType;
    searchValue: string;
  }>();

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setSorts(sorts);
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const where = useMemo(() => {
    return (
      filterSearchParams &&
      parseWhereQuery(
        filterSearchParams.filter.whereTemplate,
        filterSearchParams.searchValue,
      )
    );
  }, [filterSearchParams]);

  const searchFilterResults = useQuery(SEARCH_QUERY, {
    variables: {
      where,
    },
  });

  const filterSearchResults = useMemo(() => {
    return (
      searchFilterResults.data?.people.map(
        (person: GraphqlQueryPerson) => person.firstname,
      ) || []
    );
  }, [searchFilterResults.data?.people]);

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
            onFilterSearch={(filter, searchValue) =>
              setFilterSearchParams({ filter, searchValue })
            }
          />
        }
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
