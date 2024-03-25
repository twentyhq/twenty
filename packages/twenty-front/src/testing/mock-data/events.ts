import { Event } from '@/activities/events/types/Event';

export const mockedEvents: Array<Event> = [
  {
    properties: '{"diff": {"address": {"after": "TEST", "before": ""}}}',
    updatedAt: '2023-04-26T10:12:42.33625+00:00',
    id: '79f84835-b2f9-4ab5-8ab9-17dbcc45dda3',
    personId: null,
    companyId: 'ce40eca0-8f4b-4bba-ba91-5cbd870c64d0',
    name: 'updated.company',
    opportunityId: null,
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '20202020-0687-4c41-b707-ed1bfca972a7',
      avatarUrl: '',
      locale: 'en',
      name: {
        __typename: 'FullName',
        firstName: 'Tim',
        lastName: 'Apple',
      },
      colorScheme: 'Light',
    },
    workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
    deletedAt: null,
  },
  {
    properties:
      '{"after": {"id": "ce40eca0-8f4b-4bba-ba91-5cbd870c64d0", "name": "", "xLink": {"url": "", "label": ""}, "events": {"edges": [], "__typename": "eventConnection"}, "people": {"edges": [], "__typename": "personConnection"}, "address": "", "position": 0.5, "createdAt": "2024-03-24T21:33:45.765295", "employees": null, "favorites": {"edges": [], "__typename": "favoriteConnection"}, "updatedAt": "2024-03-24T21:33:45.765295", "__typename": "company", "domainName": "", "attachments": {"edges": [], "__typename": "attachmentConnection"}, "accountOwner": null, "linkedinLink": {"url": "", "label": ""}, "opportunities": {"edges": [], "__typename": "opportunityConnection"}, "accountOwnerId": null, "activityTargets": {"edges": [], "__typename": "activityTargetConnection"}, "idealCustomerProfile": false, "annualRecurringRevenue": {"amountMicros": null, "currencyCode": ""}}}',
    updatedAt: new Date().toISOString(),
    id: '1ad72a42-6ab4-4474-a62a-a57cae3c0298',
    personId: null,
    companyId: 'ce40eca0-8f4b-4bba-ba91-5cbd870c64d0',
    name: 'created.company',
    opportunityId: null,
    createdAt: new Date().toISOString(),
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '20202020-0687-4c41-b707-ed1bfca972a7',
      avatarUrl: '',
      locale: 'en',
      name: {
        __typename: 'FullName',
        firstName: 'Tim',
        lastName: 'Apple',
      },
      colorScheme: 'Light',
    },
    workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
    deletedAt: null,
  },
];
