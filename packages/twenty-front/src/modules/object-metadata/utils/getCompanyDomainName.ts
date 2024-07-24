import { Company } from '@/companies/types/Company';

// temporary, to remove once domainName has been fully migrated to Links type
export const getCompanyDomainName = (company: Company) => {
  if (typeof company.domainName === 'string') {
    return company.domainName;
  } else {
    return company.domainName.primaryLinkUrl;
  }
};
