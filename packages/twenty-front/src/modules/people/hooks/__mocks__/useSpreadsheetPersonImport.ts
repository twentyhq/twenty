import { gql } from '@apollo/client';

export const query = gql`
  mutation CreatePeople($data: [PersonCreateInput!]!) {
    createPeople(data: $data) {
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

export const personId = 'cb2e9f4b-20c3-4759-9315-4ffeecfaf71a';

export const variables = {
  data: [
    {
      id: personId,
      name: { firstName: 'Sheldon', lastName: ' Cooper' },
      email: undefined,
      jobTitle: undefined,
      phone: undefined,
      city: undefined,
    },
  ],
};

export const responseData = [
  {
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
    name: variables.data[0].name,
    phone: '',
    linkedinLink: {
      label: '',
      url: '',
    },
    updatedAt: '',
    avatarUrl: '',
    companyId: '',
    id: personId,
  },
];
