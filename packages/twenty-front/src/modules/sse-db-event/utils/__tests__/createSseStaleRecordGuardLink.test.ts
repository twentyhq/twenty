import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { createStore } from 'jotai';

import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { sseAppliedRecordVersionsByCacheIdState } from '@/sse-db-event/states/sseAppliedRecordVersionsByCacheIdState';
import { addSseAppliedRecordVersion } from '@/sse-db-event/utils/addSseAppliedRecordVersion';
import { createSseStaleRecordGuardLink } from '@/sse-db-event/utils/createSseStaleRecordGuardLink';

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

const setup = ({ responseUpdatedAt }: { responseUpdatedAt: string }) => {
  const store = createStore();

  store.set(
    sseAppliedRecordVersionsByCacheIdState.atom,
    addSseAppliedRecordVersion({
      sseAppliedRecordVersionsByCacheId: {},
      cacheId: 'WorkflowRun:run-1',
      record: { id: 'run-1', status: 'COMPLETED', updatedAt: COMPLETED_AT },
      nowInMs: Date.now(),
    }),
  );

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      createSseStaleRecordGuardLink({ store }),
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

  return { client };
};

const queryWorkflowRunStatus = async (client: ApolloClient) => {
  const { data } = await client.query<{ workflowRun: { status: string } }>({
    query: FIND_ONE_WORKFLOW_RUN,
    variables: { objectRecordId: 'run-1' },
  });

  return data?.workflowRun.status;
};

describe('createSseStaleRecordGuardLink', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should keep the SSE update when a response fetched before it arrives later', async () => {
    const { client } = setup({ responseUpdatedAt: RUNNING_AT });

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
    const { client } = setup({ responseUpdatedAt: '2026-10-13T10:00:03.000Z' });

    expect(await queryWorkflowRunStatus(client)).toBe('RUNNING');
  });

  it('should stop guarding once the SSE update is older than the time to live', async () => {
    const { client } = setup({ responseUpdatedAt: RUNNING_AT });

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.now() + SSE_APPLIED_RECORD_VERSION_TTL_IN_MS + 1);

    expect(await queryWorkflowRunStatus(client)).toBe('RUNNING');
  });
});
