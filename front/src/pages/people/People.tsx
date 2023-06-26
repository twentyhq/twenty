import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 as uuidv4 } from 'uuid';

import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '@/filters-and-sorts/helpers';
import { SelectedFilterType } from '@/filters-and-sorts/interfaces/filters/interface';
import {
  defaultOrderBy,
  GET_PEOPLE,
  PeopleSelectedSortType,
  usePeopleQuery,
} from '@/people/services';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { IconList, IconUser } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import {
  GetPeopleQuery,
  PersonWhereInput,
  useInsertPersonMutation,
} from '~/generated/graphql';

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
  const [where, setWhere] = useState<PersonWhereInput>({});

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<GetPeopleQuery['people'][0]>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const [insertPersonMutation] = useInsertPersonMutation();

  const { data } = usePeopleQuery(orderBy, where);

  const people = data?.people ?? [];

  async function handleAddButtonClick() {
    await insertPersonMutation({
      variables: {
        id: uuidv4(),
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        createdAt: new Date().toISOString(),
        city: '',
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
  }

  const peopleColumns = usePeopleColumns();

  const theme = useTheme();
  return (
    <WithTopBarContainer
      title="People"
      icon={<IconUser size={theme.iconSizeMedium} />}
      onAddButtonClick={handleAddButtonClick}
    >
      <>
        <StyledPeopleContainer>
          <HooksEntityTable
            numberOfColumns={peopleColumns.length}
            numberOfRows={people.length}
          />
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
  );
}
