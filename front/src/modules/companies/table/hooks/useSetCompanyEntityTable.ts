import { useRecoilCallback } from 'recoil';

import { companyAccountOwnerFamilyState } from '@/companies/states/companyAccountOwnerFamilyState';
import { companyAddressFamilyState } from '@/companies/states/companyAddressFamilyState';
import { companyCommentCountFamilyState } from '@/companies/states/companyCommentCountFamilyState';
import { companyCreatedAtFamilyState } from '@/companies/states/companyCreatedAtFamilyState';
import { companyDomainNameFamilyState } from '@/companies/states/companyDomainNameFamilyState';
import { companyEmployeesFamilyState } from '@/companies/states/companyEmployeesFamilyState';
import { companyNameFamilyState } from '@/companies/states/companyNameFamilyState';
import { GetCompaniesQuery } from '~/generated/graphql';

export function useSetCompanyEntityTable() {
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
        }
      },
    [],
  );
}
