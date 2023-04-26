import { User } from './user.interface';

export interface Opportunity {
  name: string;
  icon: string;
}

export interface Company {
  id: string;
  name: string;
  domain_name: string;
  employees: number;
  address: string;
  opportunities: Opportunity[];
  accountOwner: User;
  creationDate: Date;
}

export type GraphqlQueryAccountOwner = {
  id: string;
  email: string;
  displayName: string;
};

export type GraphqlQueryCompany = {
  id: string;
  company_name: string;
  company_domain: string;
  account_owner: GraphqlQueryAccountOwner;
  employees: number;
  address: string;
  created_at: string;
};

export const mapCompany = (company: GraphqlQueryCompany): Company => ({
  ...company,
  name: company.company_name,
  domain_name: company.company_domain,
  accountOwner: {
    id: company.account_owner.id,
    email: company.account_owner.email,
    first_name: company.account_owner.displayName.split(' ').shift() || '',
    last_name: company.account_owner.displayName.split(' ').slice(1).join(' '),
  },
  creationDate: new Date(company.created_at),
  opportunities: [{ name: 'Sales Pipeline', icon: '' }],
});

export const mapGqlCompany = (company: Company): GraphqlQueryCompany => ({
  ...company,
  company_name: company.name,
  company_domain: company.domain_name,
  created_at: company.creationDate.toUTCString(),
  account_owner: {
    id: company.accountOwner.id,
    email: company.accountOwner.email,
    displayName: `${company.accountOwner.first_name} ${company.accountOwner.last_name}`,
  },
});
