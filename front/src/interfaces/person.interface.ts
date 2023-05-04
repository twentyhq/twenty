import { Company } from './company.interface';
import { Pipe } from './pipe.interface';

export type Person = {
  id: string;
  firstname: string;
  lastname: string;
  picture?: string;
  email: string;
  company: Omit<
    Company,
    'employees' | 'address' | 'opportunities' | 'accountOwner' | 'creationDate'
  >;
  phone: string;
  creationDate: Date;
  pipe: Pipe;
  city: string;
  countryCode: string;
};

export type GraphqlQueryPerson = {
  city: string;
  company: {
    __typename: string;
    id: string;
    name: string;
    domain_name: string;
  };
  created_at: string;
  email: string;
  firstname: string;
  id: string;
  lastname: string;
  phone: string;
  __typename: string;
};

export type GraphqlMutationPerson = {
  city: string;
  company_id?: string;
  created_at: string;
  email: string;
  firstname: string;
  id: string;
  lastname: string;
  phone: string;
  __typename: string;
};

export const mapPerson = (person: GraphqlQueryPerson): Person => ({
  ...person,
  firstname: person.firstname,
  lastname: person.lastname,
  creationDate: new Date(person.created_at),
  pipe: {
    name: 'coucou',
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
    icon: '💰',
  },
  company: {
    id: person.company.id,
    name: person.company.name,
    domain_name: person.company.domain_name,
  },
  countryCode: 'FR',
});

export const mapGqlPerson = (person: Person): GraphqlMutationPerson => ({
  ...(person as Omit<Person, 'company'>),
  firstname: person.firstname,
  lastname: person.lastname,
  created_at: person.creationDate.toUTCString(),
  company_id: person.company.id,
  __typename: 'People',
});
