import { useLocation } from 'react-router-dom';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { companyAccountOwnerFamilyState } from '@/companies/states/companyAccountOwnerFamilyState';
import { companyAddressFamilyState } from '@/companies/states/companyAddressFamilyState';
import { companyCommentCountFamilyState } from '@/companies/states/companyCommentCountFamilyState';
import { companyCreatedAtFamilyState } from '@/companies/states/companyCreatedAtFamilyState';
import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { companyEmployeesFamilyState } from '@/companies/states/companyEmployeesFamilyState';
import { companyLinkedinUrlFamilyState } from '@/companies/states/companyLinkedinUrlFamilyState';
import { companyNameFamilyState } from '@/companies/states/companyNameFamilyState';
import { GetCompaniesQuery } from '~/generated/graphql';

import { companiesFilters } from '../../../../pages/companies/companies-filters';
import { availableFiltersScopedState } from '../../../ui/filter-n-sort/states/availableFiltersScopedState';
import { useContextScopeId } from '../../../ui/recoil-scope/hooks/useContextScopeId';
import { currentPageLocationState } from '../../../ui/states/currentPageLocationState';
import { useResetTableRowSelection } from '../../../ui/table/hooks/useResetTableRowSelection';
import { entityTableDimensionsState } from '../../../ui/table/states/entityTableDimensionsState';
import { isFetchingEntityTableDataState } from '../../../ui/table/states/isFetchingEntityTableDataState';
import { TableContext } from '../../../ui/table/states/TableContext';
import { tableRowIdsState } from '../../../ui/table/states/tableRowIdsState';
import { companyColumns } from '../components/companyColumns';

export function useSetCompanyEntityTable() {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableContextScopeId = useContextScopeId(TableContext);

  const currentLocation = useLocation().pathname;
  const [, setCurrentPageLocation] = useRecoilState(currentPageLocationState);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      (newCompanyArray: GetCompaniesQuery['companies']) => {
        for (const company of newCompanyArray) {
          const currentName = snapshot
            .getLoadable(companyNameFamilyState(company.id))
            .valueOrThrow();

          if (currentName !== company.name) {
            set(companyNameFamilyState(company.id), company.name);
          }

          const currentDomainName = snapshot
            .getLoadable(companyDomainNameFamilyState(company.id))
            .valueOrThrow();

          if (currentDomainName !== company.domainName) {
            set(companyDomainNameFamilyState(company.id), company.domainName);
          }

          const currentLinkedinUrl = snapshot
            .getLoadable(companyLinkedinUrlFamilyState(company.id))
            .valueOrThrow();

          if (currentLinkedinUrl !== company.linkedinUrl) {
            set(
              companyLinkedinUrlFamilyState(company.id),
              company.linkedinUrl ?? '',
            );
          }

          const currentEmployees = snapshot
            .getLoadable(companyEmployeesFamilyState(company.id))
            .valueOrThrow();

          if (currentEmployees !== company.employees) {
            set(
              companyEmployeesFamilyState(company.id),
              company.employees?.toString() ?? '',
            );
          }

          const currentAddress = snapshot
            .getLoadable(companyAddressFamilyState(company.id))
            .valueOrThrow();

          if (currentAddress !== company.address) {
            set(companyAddressFamilyState(company.id), company.address);
          }

          const currentCommentCount = snapshot
            .getLoadable(companyCommentCountFamilyState(company.id))
            .valueOrThrow();

          if (currentCommentCount !== company._commentThreadCount) {
            set(
              companyCommentCountFamilyState(company.id),
              company._commentThreadCount,
            );
          }

          const currentAccountOwner = snapshot
            .getLoadable(companyAccountOwnerFamilyState(company.id))
            .valueOrThrow();

          if (
            JSON.stringify(currentAccountOwner) !==
            JSON.stringify(company.accountOwner)
          ) {
            set(
              companyAccountOwnerFamilyState(company.id),
              company.accountOwner,
            );
          }

          const currentCreatedAt = snapshot
            .getLoadable(companyCreatedAtFamilyState(company.id))
            .valueOrThrow();

          if (currentCreatedAt !== company.createdAt) {
            set(companyCreatedAtFamilyState(company.id), company.createdAt);
          }

          const companyIds = newCompanyArray.map((company) => company.id);

          set(tableRowIdsState, (currentRowIds) => {
            if (JSON.stringify(currentRowIds) !== JSON.stringify(companyIds)) {
              return companyIds;
            }

            return currentRowIds;
          });
          resetTableRowSelection();

          set(entityTableDimensionsState, {
            numberOfColumns: companyColumns.length,
            numberOfRows: companyIds.length,
          });

          set(
            availableFiltersScopedState(tableContextScopeId),
            companiesFilters,
          );

          set(currentPageLocationState, currentLocation);

          set(isFetchingEntityTableDataState, false);
        }
      },
    [resetTableRowSelection, tableContextScopeId, currentLocation],
  );
}
