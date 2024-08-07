import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
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

export const responseData = {
  opportunities: {
    edges: [],
  },
  xLink: {
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: null,
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
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: null,
  },
  updatedAt: '',
  avatarUrl: '',
  companyId: '',
};
