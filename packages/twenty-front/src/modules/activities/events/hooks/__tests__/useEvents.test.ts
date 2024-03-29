import { renderHook } from '@testing-library/react';

import { useEvents } from '@/activities/events/hooks/useEvents';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

describe('useEvent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches events correctly for a given targetableObject', () => {
    const mockEvents = [
      {
        __typename: 'Event',
        id: '166ec73f-26b1-4934-bb3b-c86c8513b99b',
        opportunityId: null,
        opportunity: null,
        personId: null,
        person: null,
        company: {
          __typename: 'Company',
          address: 'Paris',
          linkedinLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
          xLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
          position: 4,
          domainName: 'microsoft.com',
          employees: null,
          createdAt: '2024-03-21T16:01:41.809Z',
          annualRecurringRevenue: {
            __typename: 'Currency',
            amountMicros: 100000000,
            currencyCode: 'USD',
          },
          idealCustomerProfile: false,
          accountOwnerId: null,
          updatedAt: '2024-03-22T08:28:44.812Z',
          name: 'Microsoft',
          id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        },
        workspaceMember: {
          __typename: 'WorkspaceMember',
          locale: 'en',
          avatarUrl: '',
          updatedAt: '2024-03-21T16:01:41.839Z',
          name: {
            __typename: 'FullName',
            firstName: 'Tim',
            lastName: 'Apple',
          },
          id: '20202020-0687-4c41-b707-ed1bfca972a7',
          userEmail: 'tim@apple.dev',
          colorScheme: 'Light',
          createdAt: '2024-03-21T16:01:41.839Z',
          userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
        },
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        createdAt: '2024-03-22T08:28:44.830Z',
        name: 'updated.company',
        companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        properties: '{"diff": {"address": {"after": "Paris", "before": ""}}}',
        updatedAt: '2024-03-22T08:28:44.830Z',
      },
    ];
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'Opportunity',
    };

    const useFindManyRecordsMock = jest.requireMock(
      '@/object-record/hooks/useFindManyRecords',
    );
    useFindManyRecordsMock.useFindManyRecords.mockReturnValue({
      records: mockEvents,
    });

    const { result } = renderHook(() => useEvents(mockTargetableObject));

    expect(result.current.events).toEqual(mockEvents);
  });
});
