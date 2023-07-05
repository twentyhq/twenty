
import { useCallback, useState } from 'react';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';


import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '@/filters-and-sorts/helpers';
import { SelectedFilterType } from '@/filters-and-sorts/interfaces/filters/interface';
import { useCreatePerson } from '@/people/hooks/useCreatePerson';
import {
  defaultOrderBy,
  PeopleSelectedSortType,
  usePeopleQuery,
} from '@/people/services';


import { RecoilScope } from '@/recoil-scope/components/RecoilScope';

import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconUser } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { GetPeopleQuery, PersonWhereInput } from '~/generated/graphql';

import { TableContext } from '@/ui/tables/states/TableContext';



import { TableActionBarButtonCreateCommentThreadPeople } from './table/TableActionBarButtonCreateCommentThreadPeople';
import { TableActionBarButtonDeletePeople } from './table/TableActionBarButtonDeletePeople';
import { PeopleTable } from './PeopleTable';

const StyledPeopleContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export function People() {

  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [where, setWhere] = useState<PersonWhereInput>({});
  const createPerson = useCreatePerson();

  const { data } = usePeopleQuery(orderBy, where);

  const people = data?.people ?? [];

  const handleAddButtonClick = useCallback(async () => {
    await createPerson();
  }, [createPerson]);

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
      <RecoilScope SpecificContext={TableContext}>
        <StyledPeopleContainer>
          <PeopleTable />
        </StyledPeopleContainer>
        <EntityTableActionBar>
          <TableActionBarButtonCreateCommentThreadPeople />
          <TableActionBarButtonDeletePeople />
        </EntityTableActionBar>
      </RecoilScope>
    </WithTopBarContainer>
  );
}
