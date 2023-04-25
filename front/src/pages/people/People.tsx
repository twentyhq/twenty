import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import { peopleColumns, sortsAvailable } from './people-table';
import { mapPerson } from '../../interfaces/person.interface';
import { useCallback, useState } from 'react';
import { SelectedSortType } from '../../components/table/table-header/SortAndFilterBar';
import {
  OrderBy,
  reduceSortsToOrderBy,
  usePeopleQuery,
} from '../../services/people';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
`;

const defaultOrderBy: OrderBy[] = [
  {
    created_at: 'desc',
  },
];

function People() {
  const [, setSorts] = useState([] as Array<SelectedSortType>);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<SelectedSortType>) => {
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
          />
        }
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
