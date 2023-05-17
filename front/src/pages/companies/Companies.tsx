import { useState, useCallback, useEffect, useRef } from 'react';
import { FaRegBuilding, FaList } from 'react-icons/fa';
import styled from '@emotion/styled';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
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
  reduceFiltersToWhere,
  reduceSortsToOrderBy,
} from '../../components/table/table-header/helpers';
import { Companies_Order_By } from '../../generated/graphql';
import ActionBar from '../../components/table/action-bar/ActionBar';
import { SelectedFilterType } from '../../interfaces/filters/interface';
import { BoolExpType } from '../../interfaces/entities/generic.interface';
import { useCompaniesColumns } from './companies-columns';
import { availableSorts } from './companies-sorts';
import { availableFilters } from './companies-filters';

const StyledCompaniesContainer = styled.div`
  display: flex;
  width: 100%;
`;

function Companies() {
  const [orderBy, setOrderBy] = useState<Companies_Order_By[]>(defaultOrderBy);
  const [where, setWhere] = useState<BoolExpType<Company>>({});
  const [internalData, setInternalData] = useState<Array<Company>>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string>>([]);

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
            onSortsUpdate={updateSorts}
            onFiltersUpdate={updateFilters}
            onRowSelectionChange={setSelectedRowIds}
          />
        </StyledCompaniesContainer>
        {selectedRowIds.length > 0 && <ActionBar onDeleteClick={deleteRows} />}
      </>
    </WithTopBarContainer>
  );
}

export default Companies;
