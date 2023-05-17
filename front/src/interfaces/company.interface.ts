import { Pipe } from 'stream';
import { GraphqlQueryUser, User, mapToUser } from './user.interface';

export type Company = {
  id: string;
  name?: string;
  domainName?: string;
  employees?: string;
  address?: string;

  creationDate?: Date;

  pipes?: Pipe[];
  accountOwner?: User | null;
};

export type GraphqlQueryCompany = {
  id: string;
  name?: string;
  domain_name?: string;
  employees?: string;
  address?: string;

  created_at?: string;

  account_owner?: GraphqlQueryUser | null;
  __typename: string;
};

export type GraphqlMutationCompany = {
  id: string;
  name?: string;
  domain_name?: string;
  employees?: string;
  address?: string;

  created_at?: string;

  account_owner_id?: string;
};

export const mapToCompany = (company: GraphqlQueryCompany): Company => ({
  id: company.id,
  employees: company.employees,
  name: company.name,
  address: company.address,
  domainName: company.domain_name,
  creationDate: company.created_at ? new Date(company.created_at) : undefined,

  accountOwner: company.account_owner
    ? mapToUser(company.account_owner)
    : company.account_owner,
  pipes: [],
});

export const mapToGqlCompany = (company: Company): GraphqlMutationCompany => ({
  id: company.id,
  name: company.name,
  domain_name: company.domainName,
  address: company.address,
  employees: company.employees,

  created_at: company.creationDate
    ? company.creationDate.toUTCString()
    : undefined,

  account_owner_id: company.accountOwner?.id,
});
