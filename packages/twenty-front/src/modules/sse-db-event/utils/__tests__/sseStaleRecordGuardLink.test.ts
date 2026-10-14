import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
} from '@apollo/client';

import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { registerSseAppliedRecordVersion } from '@/sse-db-event/utils/registerSseAppliedRecordVersion';
import { sseAppliedRecordVersionsByCacheId } from '@/sse-db-event/utils/sseAppliedRecordVersionsByCacheId';
import { sseStaleRecordGuardLink } from '@/sse-db-event/utils/sseStaleRecordGuardLink';

const FIND_ONE_WORKFLOW_RUN = gql`
  query FindOneWorkflowRun($objectRecordId: UUID!) {
    workflowRun(filter: { id: { eq: $objectRecordId } }) {
      id
      status
      updatedAt
    }
  }
`;

const RUNNING_AT = '2026-10-13T10:00:01.000Z';
const COMPLETED_AT = '2026-10-13T10:00:02.000Z';

const buildClient = (responseUpdatedAt: string) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      sseStaleRecordGuardLink,
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({
              data: {
                workflowRun: {
                  __typename: 'WorkflowRun',
                  id: 'run-1',
                  status: 'RUNNING',
                  updatedAt: responseUpdatedAt,
                },
              },
            });
            observer.complete();
          }),
      ),
    ]),
  });

const queryWorkflowRunStatus = async (client: ApolloClient) => {
  const { data } = await client.query<{ workflowRun: { status: string } }>({
    query: FIND_ONE_WORKFLOW_RUN,
    variables: { objectRecordId: 'run-1' },
  });

  return data?.workflowRun.status;
};

describe('sseStaleRecordGuardLink', () => {
  beforeEach(() => {
    registerSseAppliedRecordVersion({
      cacheId: 'WorkflowRun:run-1',
      record: {
        __typename: 'WorkflowRun',
        id: 'run-1',
        status: 'COMPLETED',
        updatedAt: COMPLETED_AT,
      },
    });
  });

  afterEach(() => {
    sseAppliedRecordVersionsByCacheId.clear();
    jest.restoreAllMocks();
  });

  it('should keep the SSE update when a response fetched before it arrives later', async () => {
    const client = buildClient(RUNNING_AT);

    expect(await queryWorkflowRunStatus(client)).toBe('COMPLETED');
    expect(
      client.cache.readFragment<{ status: string }>({
        id: 'WorkflowRun:run-1',
        fragment: gql`
          fragment WorkflowRunStatus on WorkflowRun {
            status
          }
        `,
      })?.status,
    ).toBe('COMPLETED');
  });

  it('should let responses newer than the SSE update through', async () => {
    const client = buildClient('2026-10-13T10:00:03.000Z');

    expect(await queryWorkflowRunStatus(client)).toBe('RUNNING');
  });

  it('should stop guarding once the SSE update is older than the time to live', async () => {
    const client = buildClient(RUNNING_AT);

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.now() + SSE_APPLIED_RECORD_VERSION_TTL_IN_MS + 1);

    expect(await queryWorkflowRunStatus(client)).toBe('RUNNING');
    expect(sseAppliedRecordVersionsByCacheId.size).toBe(0);
  });
});
