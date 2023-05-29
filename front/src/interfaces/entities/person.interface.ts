import {
  Company,
  GraphqlQueryCompany,
  mapToCompany,
} from './company.interface';
import { Pipe } from './pipe.interface';

export type Person = {
  __typename: 'people';
  id: string;
  firstname?: string;
  lastname?: string;
  picture?: string | null;
  email?: string;
  phone?: string;
  city?: string;

  createdAt?: Date;

  company?: Company | null;
  pipes?: Pipe[] | null;
};

export type GraphqlQueryPerson = {
  id: string;
  firstname?: string;
  lastname?: string;
  city?: string;
  email?: string;
  phone?: string;

  createdAt?: string;

  company?: GraphqlQueryCompany | null;

  __typename: string;
};

export type GraphqlMutationPerson = {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  city?: string;
  createdAt?: string;
  companyId?: string;
  __typename: 'people';
};

export const mapToPerson = (person: GraphqlQueryPerson): Person => ({
  __typename: 'people',
  id: person.id,
  firstname: person.firstname,
  lastname: person.lastname,
  email: person.email,
  phone: person.phone,
  city: person.city,

  createdAt: person.createdAt ? new Date(person.createdAt) : undefined,

  company: person.company ? mapToCompany(person.company) : null,
});

export const mapToGqlPerson = (person: Person): GraphqlMutationPerson => ({
  id: person.id,
  firstname: person.firstname,
  lastname: person.lastname,
  email: person.email,
  phone: person.phone,
  city: person.city,

  createdAt: person.createdAt ? person.createdAt.toUTCString() : undefined,

  companyId: person.company?.id,
  __typename: 'people',
});
