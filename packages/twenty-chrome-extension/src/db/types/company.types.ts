import { Company, CompanyConnection } from '~/generated/graphql';

export type CompanyInput = Pick<
  Company,
  'name' | 'domainName' | 'address' | 'employees' | 'linkedinLink'
>;
export type FindCompanyResponse = {
  companies: Pick<CompanyConnection, 'edges'>;
};
export type CreateCompanyResponse = { createCompany: { id: string } };
