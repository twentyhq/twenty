import { useCallback, useState } from 'react';
import { FaList } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';

import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import { EntityTable } from '../../components/table/EntityTable';

import {
  Person,
  mapToPerson,
} from '../../interfaces/entities/person.interface';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  insertPerson,
  usePeopleQuery,
} from '../../services/api/people';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';
import { SelectedFilterType } from '../../interfaces/filters/interface';
import { BoolExpType } from '../../interfaces/entities/generic.interface';
import { usePeopleColumns } from './people-columns';
import { availableSorts } from './people-sorts';
import { availableFilters } from './people-filters';
import { TbUser } from 'react-icons/tb';
import { EntityTableActionBar } from '../../components/table/action-bar/EntityTableActionBar';
import { TableActionBarButtonDeletePeople } from './table/TableActionBarButtonDeletePeople';
import { TableActionBarButtonToggleComments } from '../../components/table/action-bar/TableActionBarButtonOpenComments';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function People() {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [where, setWhere] = useState<BoolExpType<Person>>({});

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<Person>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data } = usePeopleQuery(orderBy, where);

  const people = data?.people.map(mapToPerson) ?? [];

  async function handleAddButtonClick() {
    const newPerson: Person = {
      __typename: 'people',
      id: uuidv4(),
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      company: null,
      pipes: [],
      createdAt: new Date(),
      city: '',
    };

    await insertPerson(newPerson);
  }

  const peopleColumns = usePeopleColumns();

  return (
    <WithTopBarContainer
      title="People"
      icon={<TbUser size={16} />}
      onAddButtonClick={handleAddButtonClick}
    >
      <>
        <StyledPeopleContainer>
          <EntityTable
            data={people}
            columns={peopleColumns}
            viewName="All People"
            viewIcon={<FaList />}
            availableSorts={availableSorts}
            availableFilters={availableFilters}
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
          />
        </StyledPeopleContainer>
        <EntityTableActionBar>
          <TableActionBarButtonToggleComments />
          <TableActionBarButtonDeletePeople />
        </EntityTableActionBar>
      </>
    </WithTopBarContainer>
  );
}

export default People;
