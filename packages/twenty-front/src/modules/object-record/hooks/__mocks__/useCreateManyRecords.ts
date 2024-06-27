import { gql } from '@apollo/client';

import { Person } from '@/people/types/Person';

export const query = gql`
  mutation CreatePeople($data: [PersonCreateInput!]!, $upsert: Boolean) {
    createPeople(data: $data, upsert: $upsert) {
      __typename
      xLink {
        label
        url
      }
      id
      createdAt
      city
      email
      jobTitle
      name {
        firstName
        lastName
      }
      phone
      linkedinLink {
        label
        url
      }
      updatedAt
      avatarUrl
      companyId
    }
  }
`;

const data = [
  {
    id: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
    name: { firstName: 'John', lastName: 'Doe' },
  },
  { id: '37faabcd-cb39-4a0a-8618-7e3fda9afca0', jobTitle: 'manager' },
] satisfies Partial<Person>[];

export const variables = { data };

export const responseData = {
  __typeName: '',
  xLink: {
    label: '',
    url: '',
  },
  createdAt: '',
  city: '',
  email: '',
  jobTitle: '',
  name: {
    firstName: '',
    lastName: '',
  },
  phone: '',
  linkedinLink: {
    label: '',
    url: '',
  },
  updatedAt: '',
  avatarUrl: '',
  companyId: '',
};

export const response = data.map((personData) => ({
  ...responseData,
  ...personData,
}));
