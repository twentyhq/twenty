import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useTimelineActivities } from '@/activities/timeline-activities/hooks/useTimelineActivities';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

vi.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: vi.fn(),
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useTimelineActivities', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches events correctly for a given targetableObject', () => {
    const mockedTimelineActivities = [
      {
        __typename: 'Event',
        id: '166ec73f-26b1-4934-bb3b-c86c8513b99b',
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

    vi.mocked(useFindManyRecords).mockReturnValue({
      objectMetadataItem: {
        id: '1',
        nameSingular: 'timelineActivity',
        namePlural: 'timelineActivities',
        labelSingular: 'Timeline Activity',
        labelPlural: 'Timeline Activities',
        description: null,
        icon: null,
        createdAt: '',
        updatedAt: '',
        isActive: true,
        isCustom: false,
        isSystem: false,
        isRemote: false,
        isSearchable: true,
        isUIReadOnly: false,
        isLabelSyncedWithName: false,
        applicationId: '',
        shortcut: null,
        duplicateCriteria: null,
        standardOverrides: null,
        labelIdentifierFieldMetadataId: '',
        imageIdentifierFieldMetadataId: null,
        fields: [],
        readableFields: [],
        updatableFields: [],
        indexMetadatas: [],
      },
      records: mockedTimelineActivities,
      totalCount: mockedTimelineActivities.length,
      loading: false,
      error: undefined,
      fetchMoreRecords: vi.fn(),
      queryIdentifier: '',
      hasNextPage: false,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
      },
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () => {
        return useTimelineActivities(mockTargetableObject);
      },
      { wrapper: Wrapper },
    );

    const wrongMockedTimelineActivities = [
      {
        ...mockedTimelineActivities[0],
        name: 'wrong.updated.company',
      },
    ];

    expect(result.current.timelineActivities).toEqual(mockedTimelineActivities);
    expect(result.current.timelineActivities).not.toEqual(
      wrongMockedTimelineActivities,
    );
  });
});
