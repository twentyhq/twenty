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
  reduceSortsToOrderBy,
  usePeopleQuery,
} from '../../services/people';
import { useSearch } from '../../services/search/search';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function People() {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [filterSearchResults, setFilterSearchParams] = useSearch();

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

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
            filterSearchResults={filterSearchResults.results}
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
