import { GraphqlQueryUser, User } from './user.interface';

export interface Opportunity {
  id: string;
  name: string;
  icon: string;
}

export type Company = {
  id: string;
  name: string;
  domain_name: string;
  employees: number;
  address: string;
  opportunities: Opportunity[];
  accountOwner?: User | null;
  creationDate: Date;
};

export type PartialCompany = Partial<Company> &
  Pick<Company, 'id' | 'name' | 'domain_name'>;

export type GraphqlQueryCompany = {
  id: string;
  name: string;
  domain_name: string;
  account_owner?: GraphqlQueryUser | null;
  employees: number;
  address: string;
  created_at: string;
  __typename: string;
};

export type GraphqlMutationCompany = {
  id: string;
  name: string;
  domain_name: string;
  account_owner_id?: string;
  employees: number;
  address: string;
  created_at: string;
  account_owner?: GraphqlQueryUser | null;
};

export const mapCompany = (company: GraphqlQueryCompany): Company => ({
  id: company.id,
  employees: company.employees,
  name: company.name,
  address: company.address,
  domain_name: company.domain_name,
  accountOwner: company.account_owner
    ? {
        id: company.account_owner.id,
        email: company.account_owner.email,
        displayName: company.account_owner.displayName,
      }
    : null,
  creationDate: new Date(company.created_at),
  opportunities: [],
});

export const mapGqlCompany = (company: Company): GraphqlMutationCompany => ({
  name: company.name,
  domain_name: company.domain_name,
  created_at: company.creationDate.toUTCString(),
  account_owner_id: company.accountOwner?.id,
  address: company.address,
  employees: company.employees,
  id: company.id,
  account_owner: company.accountOwner
    ? {
        id: company.accountOwner?.id,
        email: company.accountOwner?.email,
        displayName: company.accountOwner?.displayName,
        __typename: 'users',
      }
    : null,
});
