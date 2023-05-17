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
import {
  Person,
  mapToPerson,
} from '../../interfaces/entities/person.interface';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PeopleSelectedSortType,
  defaultOrderBy,
  deletePeople,
  insertPerson,
  usePeopleQuery,
} from '../../services/api/people';
import { useSearch } from '../../services/api/search/search';
import { People_Bool_Exp } from '../../generated/graphql';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';
import ActionBar from '../../components/table/action-bar/ActionBar';
import { SelectedFilterType } from '../../interfaces/filters/interface';

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
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string>>([]);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<Person>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data, loading, refetch } = usePeopleQuery(orderBy, where);

  useEffect(() => {
    if (!loading) {
      if (data) {
        setInternalData(data.people.map(mapToPerson));
      }
    }
  }, [loading, setInternalData, data]);

  const addEmptyRow = useCallback(async () => {
    const newPerson: Person = {
      __typename: 'people',
      id: uuidv4(),
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      company: null,
      pipes: [],
      creationDate: new Date(),
      city: '',
    };
    await insertPerson(newPerson);
    setInternalData([newPerson, ...internalData]);
    refetch();
  }, [internalData, setInternalData, refetch]);

  const deleteRows = useCallback(async () => {
    await deletePeople(selectedRowIds);
    setInternalData([
      ...internalData.filter((row) => !selectedRowIds.includes(row.id)),
    ]);
    refetch();
    if (tableRef.current) {
      tableRef.current.resetRowSelection();
    }
  }, [internalData, selectedRowIds, refetch]);

  const tableRef = useRef<{ resetRowSelection: () => void }>();
  const peopleColumns = usePeopleColumns();

  return (
    <WithTopBarContainer
      title="People"
      icon={<FaRegUser />}
      onAddButtonClick={addEmptyRow}
    >
      <>
        <StyledPeopleContainer>
          <Table
            ref={tableRef}
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
            onRowSelectionChange={setSelectedRowIds}
          />
        </StyledPeopleContainer>
        {selectedRowIds.length > 0 && <ActionBar onDeleteClick={deleteRows} />}
      </>
    </WithTopBarContainer>
  );
}

export default People;
