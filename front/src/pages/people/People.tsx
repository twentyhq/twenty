import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 as uuidv4 } from 'uuid';

import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '@/filters-and-sorts/helpers';
import { SelectedFilterType } from '@/filters-and-sorts/interfaces/filters/interface';
import { mapToPerson, Person } from '@/people/interfaces/person.interface';
import {
  defaultOrderBy,
  insertPerson,
  PeopleSelectedSortType,
  usePeopleQuery,
} from '@/people/services';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { IconList, IconUser } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { BoolExpType } from '@/utils/interfaces/generic.interface';
import { AppPage } from '~/AppPage';

import { TableActionBarButtonCreateCommentThreadPeople } from './table/TableActionBarButtonCreateCommentThreadPeople';
import { TableActionBarButtonDeletePeople } from './table/TableActionBarButtonDeletePeople';
import { usePeopleColumns } from './people-columns';
import { availableFilters } from './people-filters';
import { availableSorts } from './people-sorts';

const StyledPeopleContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export function People() {
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

  const theme = useTheme();
  return (
    <AppPage>
      <WithTopBarContainer
        title="People"
        icon={<IconUser size={theme.iconSizeMedium} />}
        onAddButtonClick={handleAddButtonClick}
      >
        <>
          <StyledPeopleContainer>
            <EntityTable
              data={people}
              columns={peopleColumns}
              viewName="All People"
              viewIcon={<IconList size={theme.iconSizeMedium} />}
              availableSorts={availableSorts}
              availableFilters={availableFilters}
              onSortsUpdate={updateSorts}
              onFiltersUpdate={updateFilters}
            />
          </StyledPeopleContainer>
          <EntityTableActionBar>
            <TableActionBarButtonCreateCommentThreadPeople />
            <TableActionBarButtonDeletePeople />
          </EntityTableActionBar>
        </>
      </WithTopBarContainer>
    </AppPage>
  );
}
