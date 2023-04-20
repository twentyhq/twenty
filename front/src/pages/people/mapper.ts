import { GraphqlPerson, Person } from './types';

export const mapPerson = (person: GraphqlPerson): Person => ({
  fullName: `${person.firstname} ${person.lastname}`,
  creationDate: new Date(person.created_at),
  pipe: { name: 'coucou', id: 1, icon: 'faUser' },
  ...person,
  company: {
    id: 1,
    name: person.company.company_name,
    domain: person.company.company_domain,
  },
  countryCode: 'FR',
});
