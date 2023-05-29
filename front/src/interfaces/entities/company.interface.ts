import { Pipe } from 'stream';
import { GraphqlQueryUser, User, mapToUser } from './user.interface';
import { GraphqlQueryPipe } from './pipe.interface';

export type Company = {
  __typename: 'companies';
  id: string;
  name?: string;
  domainName?: string;
  employees?: number | null;
  address?: string;

  createdAt?: Date;

  pipes?: Pipe[];
  accountOwner?: User | null;
};

export type GraphqlQueryCompany = {
  id: string;
  name?: string;
  domainName?: string;
  employees?: number | null;
  address?: string;

  createdAt?: string;

  accountOwner?: GraphqlQueryUser | null;
  pipes?: GraphqlQueryPipe[] | null;
  __typename: string;
};

export type GraphqlMutationCompany = {
  id: string;
  name?: string;
  domainName?: string;
  employees?: number | null;
  address?: string;

  createdAt?: string;

  accountOwnerId?: string;
  __typename: string;
};

export const mapToCompany = (company: GraphqlQueryCompany): Company => ({
  __typename: 'companies',
  id: company.id,
  employees: company.employees,
  name: company.name,
  address: company.address,
  domainName: company.domainName,
  createdAt: company.createdAt ? new Date(company.createdAt) : undefined,

  accountOwner: company.accountOwner
    ? mapToUser(company.accountOwner)
    : company.accountOwner,
  pipes: [],
});

export const mapToGqlCompany = (company: Company): GraphqlMutationCompany => ({
  id: company.id,
  name: company.name,
  domainName: company.domainName,
  address: company.address,
  employees: company.employees,

  createdAt: company.createdAt ? company.createdAt.toUTCString() : undefined,

  accountOwnerId: company.accountOwner?.id,
  __typename: 'companies',
});
