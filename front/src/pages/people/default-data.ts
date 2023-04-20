import { GraphqlPerson } from '../../interfaces/person.interface';

export const defaultData: Array<GraphqlPerson> = [
  {
    id: 1,
    __typename: 'Person',
    firstname: 'Alexandre',
    lastname: 'Prot',
    email: 'alexandre@qonto.com',
    company: {
      company_name: 'Qonto',
      company_domain: 'qonto.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    created_at: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
  {
    id: 2,
    __typename: 'Person',
    firstname: 'Alexandre',
    lastname: 'Prot',
    email: 'alexandre@qonto.com',
    company: {
      company_name: 'LinkedIn',
      company_domain: 'linkedin.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    created_at: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
  {
    id: 3,
    __typename: 'Person',
    firstname: 'Alexandre',
    lastname: 'Prot',
    email: 'alexandre@qonto.com',
    company: {
      company_name: 'Sequoia',
      company_domain: 'sequoiacap.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    created_at: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },

  {
    id: 4,
    __typename: 'Person',
    firstname: 'Alexandre',
    lastname: 'Prot',
    email: 'alexandre@qonto.com',
    company: {
      company_name: 'Facebook',
      company_domain: 'facebook.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    created_at: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
];
