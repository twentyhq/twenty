import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
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
