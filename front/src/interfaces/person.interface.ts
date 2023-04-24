import { Company } from './company.interface';
import { Pipe } from './pipe.interface';

export type Person = {
  id: number;
  fullName: string;
  picture?: string;
  email: string;
  company: Company;
  phone: string;
  creationDate: Date;
  pipe: Pipe;
  city: string;
  countryCode: string;
};

export type GraphqlPerson = {
  city: string;
  company: {
    __typename: string;
    company_name: string;
    company_domain: string;
  };
  created_at: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  __typename: string;
};

export type GraphqlMutationPerson = {
  city: string;
  company_id?: number;
  created_at: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  __typename: string;
};

export const mapPerson = (person: GraphqlQueryPerson): Person => ({
  fullName: `${person.firstname} ${person.lastname}`,
  creationDate: new Date(person.created_at),
  pipe: { name: 'coucou', id: 1, icon: '💰' },
  ...person,
  company: {
    id: 1,
    name: person.company.company_name,
    domain: person.company.company_domain,
  },
  countryCode: 'FR',
});

export const mapGqlPerson = (person: Person): GraphqlMutationPerson => ({
  firstname: person.fullName.split(' ').shift() || '',
  lastname: person.fullName.split(' ').slice(1).join(' '),
  created_at: person.creationDate.toUTCString(),
  company_id: person.company.id,
  ...(person as Omit<Person, 'company'>),
  __typename: 'People',
});
