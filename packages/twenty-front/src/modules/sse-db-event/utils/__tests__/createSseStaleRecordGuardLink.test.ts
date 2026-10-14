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
import { addSseAppliedRecordVersions } from '@/sse-db-event/utils/addSseAppliedRecordVersions';
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

const FIND_ONE_WORKFLOW_RUN_STEP_LOGS = gql`
  query FindOneWorkflowRunStepLogs($objectRecordId: UUID!) {
    workflowRun(filter: { id: { eq: $objectRecordId } }) {
      id
      stepLogs
    }
  }
`;

const RUNNING_AT = '2026-10-13T10:00:01.000Z';
const COMPLETED_AT = '2026-10-13T10:00:02.000Z';

const COMPLETED_WORKFLOW_RUN = {
  id: 'run-1',
  status: 'COMPLETED',
  stepLogs: { 'step-1': 'completed' },
  updatedAt: COMPLETED_AT,
};

const setup = ({
  responseWorkflowRun,
  isSseUpdateAppliedDuringRequest = false,
}: {
  responseWorkflowRun: Record<string, unknown>;
  isSseUpdateAppliedDuringRequest?: boolean;
}) => {
  const store = createStore();

  const applySseUpdate = (nowInMs: number) =>
    store.set(sseAppliedRecordVersionsByCacheIdState.atom, (versions) =>
      addSseAppliedRecordVersions({
        sseAppliedRecordVersionsByCacheId: versions,
        appliedRecords: [
          { cacheId: 'WorkflowRun:run-1', record: COMPLETED_WORKFLOW_RUN },
        ],
        nowInMs,
      }),
    );

  if (!isSseUpdateAppliedDuringRequest) {
    applySseUpdate(Date.now() - 1);
  }

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      createSseStaleRecordGuardLink({ store }),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            if (isSseUpdateAppliedDuringRequest) {
              applySseUpdate(Date.now() + 1);
            }

            observer.next({
              data: {
                workflowRun: {
                  __typename: 'WorkflowRun',
                  ...responseWorkflowRun,
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

const queryWorkflowRun = async ({
  client,
  query,
}: {
  client: ApolloClient;
  query: typeof FIND_ONE_WORKFLOW_RUN;
}) => {
  const { data } = await client.query<{
    workflowRun: Record<string, unknown>;
  }>({
    query,
    variables: { objectRecordId: 'run-1' },
  });

  return data?.workflowRun;
};

describe('createSseStaleRecordGuardLink', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should keep the SSE update when a response fetched before it arrives later', async () => {
    const { client } = setup({
      responseWorkflowRun: {
        id: 'run-1',
        status: 'RUNNING',
        updatedAt: RUNNING_AT,
      },
    });

    expect(
      (await queryWorkflowRun({ client, query: FIND_ONE_WORKFLOW_RUN }))
        ?.status,
    ).toBe('COMPLETED');
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
    const { client } = setup({
      responseWorkflowRun: {
        id: 'run-1',
        status: 'RUNNING',
        updatedAt: '2026-10-13T10:00:03.000Z',
      },
    });

    expect(
      (await queryWorkflowRun({ client, query: FIND_ONE_WORKFLOW_RUN }))
        ?.status,
    ).toBe('RUNNING');
  });

  it('should stop guarding once the SSE update is older than the time to live', async () => {
    const { client } = setup({
      responseWorkflowRun: {
        id: 'run-1',
        status: 'RUNNING',
        updatedAt: RUNNING_AT,
      },
    });

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.now() + SSE_APPLIED_RECORD_VERSION_TTL_IN_MS + 1);

    expect(
      (await queryWorkflowRun({ client, query: FIND_ONE_WORKFLOW_RUN }))
        ?.status,
    ).toBe('RUNNING');
  });

  it('should keep the SSE update on a record selected without updatedAt when it arrives during the request', async () => {
    const { client } = setup({
      responseWorkflowRun: { id: 'run-1', stepLogs: { 'step-1': 'running' } },
      isSseUpdateAppliedDuringRequest: true,
    });

    expect(
      (
        await queryWorkflowRun({
          client,
          query: FIND_ONE_WORKFLOW_RUN_STEP_LOGS,
        })
      )?.stepLogs,
    ).toEqual({ 'step-1': 'completed' });
  });

  it('should let a response without updatedAt through when its request was sent after the SSE update', async () => {
    const { client } = setup({
      responseWorkflowRun: { id: 'run-1', stepLogs: { 'step-1': 'running' } },
    });

    expect(
      (
        await queryWorkflowRun({
          client,
          query: FIND_ONE_WORKFLOW_RUN_STEP_LOGS,
        })
      )?.stepLogs,
    ).toEqual({ 'step-1': 'running' });
  });
});
