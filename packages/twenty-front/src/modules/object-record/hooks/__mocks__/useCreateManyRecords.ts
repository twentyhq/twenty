import { gql } from '@apollo/client';

import { Person } from '@/people/types/Person';

export const query = gql`
  mutation CreatePeople($data: [PersonCreateInput!]!) {
    createPeople(data: $data) {
      id
      opportunities {
        edges {
          node {
            __typename
            id
          }
        }
      }
      xLink {
        label
        url
      }
      id
      pointOfContactForOpportunities {
        edges {
          node {
            __typename
            id
          }
        }
      }
      createdAt
      company {
        __typename
        id
      }
      city
      email
      activityTargets {
        edges {
          node {
            __typename
            id
          }
        }
      }
      jobTitle
      favorites {
        edges {
          node {
            __typename
            id
          }
        }
      }
      attachments {
        edges {
          node {
            __typename
            id
          }
        }
      }
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
  opportunities: {
    edges: [],
  },
  xLink: {
    label: '',
    url: '',
  },
  pointOfContactForOpportunities: {
    edges: [],
  },
  createdAt: '',
  company: {
    id: '',
  },
  city: '',
  email: '',
  activityTargets: {
    edges: [],
  },
  jobTitle: '',
  favorites: {
    edges: [],
  },
  attachments: {
    edges: [],
  },
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
