import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { act, renderHook, waitFor } from '@testing-library/react';
import { percentage, sleep, useTableData } from '../useTableData';

import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { recordBoardKanbanFieldMetadataNameComponentState } from '@/object-record/record-board/states/recordBoardKanbanFieldMetadataNameComponentState';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { ViewType } from '@/views/types/ViewType';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import gql from 'graphql-tag';
import { ReactNode } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

const defaultResponseData = {
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  },
  totalCount: 1,
};
const mockPerson = {
  __typename: 'Person',
  updatedAt: '2021-08-03T19:20:06.000Z',
  myCustomObjectId: '123',
  whatsapp: '123',
  linkedinLink: {
    primaryLinkUrl: 'https://www.linkedin.com',
    primaryLinkLabel: 'linkedin',
    secondaryLinks: ['https://www.linkedin.com'],
  },
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  email: 'email',
  position: 'position',
  createdBy: {
    source: 'source',
    workspaceMemberId: '1',
    name: 'name',
  },
  avatarUrl: 'avatarUrl',
  jobTitle: 'jobTitle',
  xLink: {
    primaryLinkUrl: 'https://www.linkedin.com',
    primaryLinkLabel: 'linkedin',
    secondaryLinks: ['https://www.linkedin.com'],
  },
  performanceRating: 1,
  createdAt: '2021-08-03T19:20:06.000Z',
  phone: 'phone',
  id: '123',
  city: 'city',
  companyId: '1',
  intro: 'intro',
  workPrefereance: 'workPrefereance',
};
const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query FindManyPeople(
          $filter: PersonFilterInput
          $orderBy: [PersonOrderByInput]
          $lastCursor: String
          $limit: Int
        ) {
          people(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
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
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        filter: undefined,
        limit: 30,
        orderBy: [{ position: 'AscNullsFirst' }],
      },
    },
    result: jest.fn(() => ({
      data: {
        people: {
          ...defaultResponseData,
          edges: [
            {
              node: mockPerson,
              cursor: '1',
            },
          ],
        },
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <Router>
    <RecoilRoot>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider addTypename={false} mocks={mocks}>
          {children}
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  </Router>
);

const graphqlEmptyResponse = [
  {
    ...mocks[0],
    result: jest.fn(() => ({
      data: {
        people: {
          ...defaultResponseData,
          edges: [],
        },
      },
    })),
  },
];

const WrapperWithEmptyResponse = ({ children }: { children: ReactNode }) => (
  <Router>
    <RecoilRoot>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider addTypename={false} mocks={graphqlEmptyResponse}>
          {children}
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  </Router>
);

describe('useTableData', () => {
  const recordIndexId = 'people';
  const objectNameSingular = 'person';
  describe('data fetching', () => {
    it('should handle no records', async () => {
      const callback = jest.fn();
      const { result } = renderHook(
        () =>
          useTableData({
            recordIndexId,
            objectNameSingular,
            callback,

            delayMs: 0,
            viewType: ViewType.Kanban,
          }),
        { wrapper: WrapperWithEmptyResponse },
      );

      await act(async () => {
        result.current.getTableData();
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith([], []);
      });
    });

    it('should call the callback function with fetched data', async () => {
      const callback = jest.fn();
      const { result } = renderHook(
        () =>
          useTableData({
            recordIndexId,
            objectNameSingular,
            callback,

            delayMs: 0,
          }),
        { wrapper: Wrapper },
      );

      await act(async () => {
        result.current.getTableData();
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith([mockPerson], []);
      });
    });

    it('should call the callback function with kanban field included as column if view type is kanban', async () => {
      const callback = jest.fn();
      const { result } = renderHook(
        () => {
          const kanbanFieldNameState = extractComponentState(
            recordBoardKanbanFieldMetadataNameComponentState,
            recordIndexId,
          );
          return {
            tableData: useTableData({
              recordIndexId,
              objectNameSingular,
              callback,
              pageSize: 30,
              maximumRequests: 100,
              delayMs: 0,
              viewType: ViewType.Kanban,
            }),
            setKanbanFieldName: useRecordBoard(recordIndexId),
            kanbanFieldName: useRecoilValue(kanbanFieldNameState),
            kanbanData: useRecordIndexOptionsForBoard({
              objectNameSingular,
              recordBoardId: recordIndexId,
              viewBarId: recordIndexId,
            }),
          };
        },
        {
          wrapper: Wrapper,
        },
      );

      await act(async () => {
        result.current.setKanbanFieldName.setKanbanFieldMetadataName(
          result.current.kanbanData.hiddenBoardFields[0].metadata.fieldName,
        );
      });

      await act(async () => {
        result.current.tableData.getTableData();
      });

      await waitFor(async () => {
        expect(callback).toHaveBeenCalledWith(
          [mockPerson],
          [
            {
              defaultValue: 'now',
              editButtonIcon: undefined,
              fieldMetadataId: '102963b7-3e77-4293-a1e6-1ab59a02b663',
              iconName: 'IconCalendarClock',
              isFilterable: true,
              isLabelIdentifier: false,
              isSortable: true,
              isVisible: false,
              label: 'Last update',
              labelWidth: undefined,
              metadata: {
                fieldName: 'updatedAt',
                isNullable: false,
                objectMetadataNameSingular: 'person',
                options: null,
                placeHolder: 'Last update',
                relationFieldMetadataId: undefined,
                relationObjectMetadataNamePlural: '',
                relationObjectMetadataNameSingular: '',
                relationType: undefined,
                targetFieldMetadataName: '',
              },
              position: 0,
              showLabel: undefined,
              size: 100,
              type: 'DATE_TIME',
            },
          ],
        );
      });
    });

    it('should not call the callback function with kanban field included as column if view type is table', async () => {
      const callback = jest.fn();
      const { result } = renderHook(
        () => {
          const kanbanFieldNameState = extractComponentState(
            recordBoardKanbanFieldMetadataNameComponentState,
            recordIndexId,
          );
          return {
            tableData: useTableData({
              recordIndexId,
              objectNameSingular,
              callback,
              pageSize: 30,
              maximumRequests: 100,
              delayMs: 0,
              viewType: ViewType.Table,
            }),
            setKanbanFieldName: useRecordBoard(recordIndexId),
            kanbanFieldName: useRecoilValue(kanbanFieldNameState),
            kanbanData: useRecordIndexOptionsForBoard({
              objectNameSingular,
              recordBoardId: recordIndexId,
              viewBarId: recordIndexId,
            }),
          };
        },
        {
          wrapper: Wrapper,
        },
      );

      await act(async () => {
        result.current.setKanbanFieldName.setKanbanFieldMetadataName(
          result.current.kanbanData.hiddenBoardFields[0].metadata.fieldName,
        );
      });

      await act(async () => {
        result.current.tableData.getTableData();
      });

      await waitFor(async () => {
        expect(callback).toHaveBeenCalledWith([mockPerson], []);
      });
    });
  });

  describe('utils', () => {
    it('should correctly calculate percentage', () => {
      expect(percentage(50, 200)).toBe(25);
      expect(percentage(1, 3)).toBe(33);
    });

    it('should resolve sleep after given time', async () => {
      jest.useFakeTimers();
      const sleepPromise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(sleepPromise).resolves.toBeUndefined();
    });
  });
});
