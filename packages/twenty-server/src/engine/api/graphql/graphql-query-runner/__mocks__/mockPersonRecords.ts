import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const mockPersonRecords: Partial<ObjectRecord>[] = [
  {
    name: {
      firstName: 'Testfirst',
      lastName: 'Testlast',
    },
    emails: {
      primaryEmail: 'test@test.fr',
      additionalEmails: [],
    },
    linkedinLink: {
      primaryLinkLabel: '',
      primaryLinkUrl: '',
      secondaryLinks: [],
    },
    jobTitle: 'Test job',
  },
];
