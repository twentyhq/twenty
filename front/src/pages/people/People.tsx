import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import {
  availableFilters,
  peopleColumns,
  sortsAvailable,
} from './people-table';
import { mapPerson } from '../../interfaces/person.interface';
import { useCallback, useState } from 'react';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  reduceSortsToOrderBy,
  usePeopleQuery,
} from '../../services/people';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
`;

function People() {
  const [, setSorts] = useState([] as Array<PeopleSelectedSortType>);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setSorts(sorts);
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
            onSortsUpdate={updateSorts}
            sortsAvailable={sortsAvailable}
            availableFilters={availableFilters}
          />
        }
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
