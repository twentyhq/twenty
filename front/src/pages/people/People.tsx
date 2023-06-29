import { useCallback, useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { queuedActionsState } from '@/command-menu/states/queuedAction';
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

  const [queuedActions, setQueuedActions] = useRecoilState(queuedActionsState);

  const [insertPersonMutation] = useInsertPersonMutation();

  const { data } = usePeopleQuery(orderBy, where);

  const people = data?.people ?? [];

  const handleAddButtonClick = useCallback(async () => {
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
  }, [insertPersonMutation]);

  useEffect(() => {
    if (queuedActions.includes('people/create_people')) {
      handleAddButtonClick();
      setQueuedActions(
        queuedActions.filter((action) => action !== 'people/create_people'),
      );
    }
  }, [queuedActions, handleAddButtonClick, setQueuedActions]);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<GetPeopleQuery['people'][0]>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const peopleColumns = usePeopleColumns();

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title="People"
      icon={<IconUser size={theme.icon.size.md} />}
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
            viewIcon={<IconList size={theme.icon.size.md} />}
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
