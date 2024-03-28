import { gql } from '@apollo/client';

export const query = gql`
  mutation UpdateOnePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
    updatePerson(id: $idToUpdate, data: $input) {
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

const basePerson = {
  id: '36abbb63-34ed-4a16-89f5-f549ac55d0f9',
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

const connectedObjects = {
  favorites: {
    edges: [],
  },
  opportunities: {
    edges: [],
  },
  pointOfContactForOpportunities: {
    edges: [],
  },
  activityTargets: {
    edges: [],
  },
  attachments: {
    edges: [],
  },
  company: {
    id: '',
  },
};

export const variables = {
  idToUpdate: '36abbb63-34ed-4a16-89f5-f549ac55d0f9',
  input: {
    ...basePerson,
    name: { firstName: 'John', lastName: 'Doe' },
  },
};

export const responseData = {
  ...{ ...basePerson, __typename: 'Person' },
  ...connectedObjects,
};
