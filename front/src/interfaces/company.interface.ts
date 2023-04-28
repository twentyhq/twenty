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
  accountOwner?: User;
  creationDate: Date;
}

export type GraphqlQueryAccountOwner = {
  id: string;
  email: string;
  displayName: string;
};

export type GraphqlQueryCompany = {
  id: string;
  name: string;
  domain_name: string;
  account_owner?: GraphqlQueryAccountOwner;
  employees: number;
  address: string;
  created_at: string;
};

export type GraphqlMutationCompany = {
  id: string;
  name: string;
  domain_name: string;
  account_owner_id?: string;
  employees: number;
  address: string;
  created_at: string;
};

export const mapCompany = (company: GraphqlQueryCompany): Company => ({
  ...company,
  name: company.name,
  domain_name: company.domain_name,
  accountOwner: company.account_owner
    ? {
        id: company.account_owner.id,
        email: company.account_owner.email,
        first_name: company.account_owner.displayName.split(' ').shift() || '',
        last_name: company.account_owner.displayName
          .split(' ')
          .slice(1)
          .join(' '),
      }
    : undefined,
  creationDate: new Date(company.created_at),
  opportunities: [{ name: 'Sales Pipeline', icon: '' }],
});

export const mapGqlCompany = (company: Company): GraphqlMutationCompany => ({
  ...company,
  name: company.name,
  domain_name: company.domain_name,
  created_at: company.creationDate.toUTCString(),
  account_owner_id: company.accountOwner?.id,
});
