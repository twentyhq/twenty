import { FaRegBuilding, FaList } from 'react-icons/fa';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import styled from '@emotion/styled';
import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  CompaniesSelectedSortType,
  defaultOrderBy,
  deleteCompanies,
  insertCompany,
  useCompaniesQuery,
} from '../../services/api/companies';
import Table from '../../components/table/Table';
import {
  Company,
  mapToCompany,
} from '../../interfaces/entities/company.interface';
import {
  useCompaniesColumns,
  availableFilters,
  availableSorts,
} from './companies-table';
import {
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';
import {
  Companies_Bool_Exp,
  Companies_Order_By,
} from '../../generated/graphql';
import { useSearch } from '../../services/api/search/search';
import ActionBar from '../../components/table/action-bar/ActionBar';
import { SelectedFilterType } from '../../interfaces/filters/interface';

const StyledCompaniesContainer = styled.div`
  display: flex;
  width: 100%;
`;

function Companies() {
  const [orderBy, setOrderBy] = useState<Companies_Order_By[]>(defaultOrderBy);
  const [where, setWhere] = useState<Companies_Bool_Exp>({});
  const [internalData, setInternalData] = useState<Array<Company>>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string>>([]);

  const [filterSearchResults, setSearhInput, setFilterSearch] = useSearch();

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const updateFilters = useCallback(
    (filters: Array<SelectedFilterType<Company>>) => {
      setWhere(reduceFiltersToWhere(filters));
    },
    [],
  );

  const { data, loading, refetch } = useCompaniesQuery(orderBy, where);

  useEffect(() => {
    if (!loading) {
      if (data) {
        setInternalData(data.companies.map(mapToCompany));
      }
    }
  }, [loading, setInternalData, data]);

  const addEmptyRow = useCallback(async () => {
    const newCompany: Company = {
      id: uuidv4(),
      name: '',
      domainName: '',
      employees: '0',
      address: '',
      pipes: [],
      creationDate: new Date(),
      accountOwner: null,
      __typename: 'companies',
    };
    await insertCompany(newCompany);
    setInternalData([newCompany, ...internalData]);
    refetch();
  }, [internalData, setInternalData, refetch]);

  const deleteRows = useCallback(async () => {
    await deleteCompanies(selectedRowIds);
    setInternalData([
      ...internalData.filter((row) => !selectedRowIds.includes(row.id)),
    ]);
    refetch();
    if (tableRef.current) {
      tableRef.current.resetRowSelection();
    }
  }, [internalData, selectedRowIds, refetch]);

  const companiesColumns = useCompaniesColumns();
  const tableRef = useRef<{ resetRowSelection: () => void }>();

  return (
    <WithTopBarContainer
      title="Companies"
      icon={<FaRegBuilding />}
      onAddButtonClick={addEmptyRow}
    >
      <>
        <StyledCompaniesContainer>
          <Table
            ref={tableRef}
            data={internalData}
            columns={companiesColumns}
            viewName="All Companies"
            viewIcon={<FaList />}
            availableSorts={availableSorts}
            availableFilters={availableFilters}
            filterSearchResults={filterSearchResults}
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
            onFilterSearch={(filter, searchValue) => {
              setSearhInput(searchValue);
              setFilterSearch(filter);
            }}
            onRowSelectionChange={setSelectedRowIds}
          />
        </StyledCompaniesContainer>
        {selectedRowIds.length > 0 && <ActionBar onDeleteClick={deleteRows} />}
      </>
    </WithTopBarContainer>
  );
}

export default Companies;
