import {
  Company,
  GraphqlQueryCompany,
  mapToCompany,
} from './company.interface';
import { Pipe } from './pipe.interface';

export type Person = {
  id: string;
  firstname?: string;
  lastname?: string;
  picture?: string | null;
  email?: string;
  phone?: string;
  city?: string;

  creationDate?: Date;

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

  created_at?: string;

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
  created_at?: string;
  company_id?: string;
  __typename: string;
};

export const mapToPerson = (person: GraphqlQueryPerson): Person => ({
  id: person.id,
  firstname: person.firstname,
  lastname: person.lastname,
  email: person.email,
  phone: person.phone,
  city: person.city,

  creationDate: person.created_at ? new Date(person.created_at) : undefined,

  company: person.company ? mapToCompany(person.company) : null,
});

export const mapToGqlPerson = (person: Person): GraphqlMutationPerson => ({
  id: person.id,
  firstname: person.firstname,
  lastname: person.lastname,
  email: person.email,
  phone: person.phone,
  city: person.city,

  created_at: person.creationDate
    ? person.creationDate.toUTCString()
    : undefined,

  company_id: person.company?.id,
  __typename: 'people',
});
