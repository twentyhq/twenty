import { FaRegUser, FaList } from 'react-icons/fa';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';
import {
  availableFilters,
  availableSorts,
  usePeopleColumns,
} from './people-table';
import { Person, mapPerson } from '../../interfaces/person.interface';
import { useCallback, useEffect, useState } from 'react';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  insertPerson,
  usePeopleQuery,
} from '../../services/people';
import { useSearch } from '../../services/search/search';
import { People_Bool_Exp } from '../../generated/graphql';
import { SelectedFilterType } from '../../components/table/table-header/interface';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function People() {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [where, setWhere] = useState<People_Bool_Exp>({});
  const [filterSearchResults, setSearchInput, setFilterSearch] = useSearch();
  const [internalData, setInternalData] = useState<Array<Person>>([]);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<People_Bool_Exp>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data, loading, refetch } = usePeopleQuery(orderBy, where);

  useEffect(() => {
    if (!loading) {
      if (data) {
        setInternalData(data.people.map(mapPerson));
      }
    }
  }, [loading, setInternalData, data]);

  const addEmptyRow = useCallback(() => {
    const newCompany: Person = {
      id: uuidv4(),
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      company: null,
      pipe: null,
      creationDate: new Date(),
      city: '',
    };
    insertPerson(newCompany);
    setInternalData([newCompany, ...internalData]);
    refetch();
  }, [internalData, setInternalData, refetch]);

  const peopleColumns = usePeopleColumns();

  return (
    <WithTopBarContainer
      title="People"
      icon={<FaRegUser />}
      onAddButtonClick={addEmptyRow}
    >
      <StyledPeopleContainer>
        {
          <Table
            data={internalData}
            columns={peopleColumns}
            viewName="All People"
            viewIcon={<FaList />}
            availableSorts={availableSorts}
            availableFilters={availableFilters}
            filterSearchResults={filterSearchResults}
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
            onFilterSearch={(filter, searchValue) => {
              setSearchInput(searchValue);
              setFilterSearch(filter);
            }}
          />
        }
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
