import { peopleAvailableColumnDefinitions } from '@/people/constants/peopleAvailableColumnDefinitions';
import { Company, Person, ViewField } from '~/generated/graphql';

type RequiredAndNotNull<T> = {
  [P in keyof T]-?: Exclude<T[P], null | undefined>;
};

type MockedPerson = RequiredAndNotNull<
  Pick<
    Person,
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'displayName'
    | 'linkedinUrl'
    | 'xUrl'
    | 'jobTitle'
    | 'email'
    | '__typename'
    | 'phone'
    | 'city'
    | 'avatarUrl'
    | '_activityCount'
    | 'createdAt'
  > & {
    company: Pick<Company, 'id' | 'name' | 'domainName' | '__typename'>;
  }
>;

export const mockedPeopleData: MockedPerson[] = [
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
    __typename: 'Person',
    firstName: 'Alexandre',
    lastName: 'Prot',
    displayName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    linkedinUrl: 'https://www.linkedin.com/in/alexandreprot/',
    xUrl: 'https://twitter.com/alexandreprot',
    avatarUrl:
      'data:image/jpeg;base64,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',
    jobTitle: 'CEO',
    company: {
      id: '5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
      name: 'Qonto',
      domainName: 'qonto.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    _activityCount: 1,
    createdAt: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    __typename: 'Person',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    linkedinUrl: 'https://www.linkedin.com/in/johndoe/',
    xUrl: 'https://twitter.com/johndoe',
    avatarUrl: '',
    jobTitle: 'CTO',
    email: 'john@linkedin.com',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6e',
      name: 'LinkedIn',
      domainName: 'linkedin.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    _activityCount: 1,
    createdAt: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6f',
    __typename: 'Person',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane Doe',
    linkedinUrl: 'https://www.linkedin.com/in/janedoe/',
    xUrl: 'https://twitter.com/janedoe',
    avatarUrl: '',
    jobTitle: 'Investor',
    email: 'jane@sequoiacap.com',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6g',
      name: 'Sequoia',
      domainName: 'sequoiacap.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    _activityCount: 1,
    createdAt: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6h',
    __typename: 'Person',
    firstName: 'Janice',
    lastName: 'Dane',
    displayName: 'Janice Dane',
    email: 'janice@facebook.com',
    linkedinUrl: 'https://www.linkedin.com/in/janicedane/',
    xUrl: 'https://twitter.com/janicedane',
    avatarUrl: '',
    jobTitle: 'CEO',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6i',
      name: 'Facebook',
      domainName: 'facebook.com',
      __typename: 'Company',
    },
    phone: '06 12 34 56 78',
    _activityCount: 2,
    createdAt: '2023-04-20T13:20:09.158312+00:00',

    city: 'Paris',
  },
];

export const mockedPersonViewFields =
  peopleAvailableColumnDefinitions.map<ViewField>((viewFieldDefinition) => ({
    __typename: 'ViewField',
    fieldName: viewFieldDefinition.label,
    id: viewFieldDefinition.id,
    index: viewFieldDefinition.order,
    isVisible: true,
    objectName: 'person',
    sizeInPx: viewFieldDefinition.size,
  }));
