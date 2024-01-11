import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      id
      opportunities {
        edges {
          node {
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
            id
          }
        }
      }
      createdAt
      company {
        id
      }
      city
      email
      activityTargets {
        edges {
          node {
            id
          }
        }
      }
      jobTitle
      favorites {
        edges {
          node {
            id
          }
        }
      }
      attachments {
        edges {
          node {
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

export const variables = {
  input: { id: 'a7286b9a-c039-4a89-9567-2dfa7953cda9' },
};

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
