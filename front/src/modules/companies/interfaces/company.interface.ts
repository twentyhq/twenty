import {
  GraphqlQueryPipeline,
  Pipeline,
} from '../../pipelines/interfaces/pipeline.interface';
import {
  GraphqlQueryUser,
  mapToUser,
  User,
} from '../../users/interfaces/user.interface';

export type Company = {
  __typename: 'Company';
  id: string;
  name?: string;
  domainName?: string;
  employees?: number | null;
  address?: string;

  createdAt?: Date;

  pipes?: Pipeline[];
  accountOwner?: User | null;

  _commentCount?: number;
};

export type GraphqlQueryCompany = {
  id: string;
  name?: string;
  domainName?: string;
  employees?: number | null;
  address?: string;

  createdAt?: string;

  accountOwner?: GraphqlQueryUser | null;
  pipes?: GraphqlQueryPipeline[] | null;
  __typename?: string;

  _commentCount?: number;
};

export type GraphqlMutationCompany = {
  id: string;
  name?: string;
  domainName?: string;
  employees?: number | null;
  address?: string;

  createdAt?: string;

  accountOwnerId?: string;
  __typename?: string;
};

export const mapToCompany = (company: GraphqlQueryCompany): Company => ({
  __typename: 'Company',
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

  _commentCount: company._commentCount,
});

export const mapToGqlCompany = (company: Company): GraphqlMutationCompany => ({
  id: company.id,
  name: company.name,
  domainName: company.domainName,
  address: company.address,
  employees: company.employees,

  createdAt: company.createdAt ? company.createdAt.toUTCString() : undefined,

  accountOwnerId: company.accountOwner?.id,
  __typename: 'Company',
});
