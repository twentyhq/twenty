import { gql } from '@apollo/client';

export const query = gql`
  mutation UpdateOnePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
    updatePerson(id: $idToUpdate, data: $input) {
      __typename
      updatedAt
      myCustomObjectId
      whatsapp
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      name {
        firstName
        lastName
      }
      email
      position
      createdBy {
        source
        workspaceMemberId
        name
      }
      avatarUrl
      jobTitle
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      performanceRating
      createdAt
      phone
      id
      city
      companyId
      intro
      workPrefereance
    }
  }
`;

const basePerson = {
  id: '36abbb63-34ed-4a16-89f5-f549ac55d0f9',
  xLink: {
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: null,
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
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: null,
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
