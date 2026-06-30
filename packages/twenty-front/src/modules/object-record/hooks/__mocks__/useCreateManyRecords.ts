import { gql } from '@apollo/client';

import { PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { Person } from '@/people/types/Person';

export const query = gql`
  mutation CreatePeople($data: [PersonCreateInput!]!, $upsert: Boolean) {
    createPeople(data: $data, upsert: $upsert) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS}
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
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: [],
  },
  createdAt: '',
  city: '',
  email: '',
  jobTitle: '',
  name: {
    firstName: '',
    lastName: '',
  },
  phones: {
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    primaryPhoneNumber: '',
  },
  linkedinLink: {
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: [],
  },
  updatedAt: '',
  avatarUrl: '',
  companyId: '',
};

export const response = data.map((personData) => ({
  ...responseData,
  ...personData,
}));
