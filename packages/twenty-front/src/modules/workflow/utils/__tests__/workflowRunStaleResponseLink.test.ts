import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
} from '@apollo/client';

import { workflowRunStaleResponseLink } from '@/workflow/utils/workflowRunStaleResponseLink';

const FIND_ONE_WORKFLOW_RUN = gql`
  query FindOneWorkflowRun($objectRecordId: UUID!) {
    workflowRun(filter: { id: { eq: $objectRecordId } }) {
      id
      status
      stepLogs
      updatedAt
    }
  }
`;

const FIND_ONE_COMPANY = gql`
  query FindOneCompany($objectRecordId: UUID!) {
    company(filter: { id: { eq: $objectRecordId } }) {
      id
      name
      updatedAt
    }
  }
`;

const RUNNING_AT = '2026-10-13T10:00:01.000Z';
const COMPLETED_AT = '2026-10-13T10:00:02.000Z';

const setup = ({ response }: { response: Record<string, unknown> }) => {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      workflowRunStaleResponseLink,
      new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({ data: response });
            observer.complete();
          }),
      ),
    ]),
  });

  client.cache.writeQuery({
    query: FIND_ONE_WORKFLOW_RUN,
    variables: { objectRecordId: 'run-1' },
    data: {
      workflowRun: {
        __typename: 'WorkflowRun',
        id: 'run-1',
        status: 'COMPLETED',
        stepLogs: { 'step-1': 'completed' },
        updatedAt: COMPLETED_AT,
      },
    },
  });

  client.cache.writeQuery({
    query: FIND_ONE_COMPANY,
    variables: { objectRecordId: 'company-1' },
    data: {
      company: {
        __typename: 'Company',
        id: 'company-1',
        name: 'Apple',
        updatedAt: COMPLETED_AT,
      },
    },
  });

  return { client };
};

const queryWorkflowRun = async ({ client }: { client: ApolloClient }) => {
  const { data } = await client.query<{
    workflowRun: Record<string, unknown>;
  }>({
    query: FIND_ONE_WORKFLOW_RUN,
    variables: { objectRecordId: 'run-1' },
    fetchPolicy: 'network-only',
  });

  return data?.workflowRun;
};

describe('workflowRunStaleResponseLink', () => {
  it('should keep the cached run when an older response lands after it', async () => {
    const { client } = setup({
      response: {
        workflowRun: {
          __typename: 'WorkflowRun',
          id: 'run-1',
          status: 'RUNNING',
          stepLogs: { 'step-1': 'running' },
          updatedAt: RUNNING_AT,
        },
      },
    });

    expect(await queryWorkflowRun({ client })).toMatchObject({
      status: 'COMPLETED',
      stepLogs: { 'step-1': 'completed' },
      updatedAt: COMPLETED_AT,
    });
  });

  it('should keep a cached null value when an older response has one set', async () => {
    const { client } = setup({
      response: {
        workflowRun: {
          __typename: 'WorkflowRun',
          id: 'run-1',
          status: 'FAILED',
          stepLogs: { 'step-1': 'failed' },
          updatedAt: COMPLETED_AT,
        },
      },
    });

    client.cache.writeQuery({
      query: FIND_ONE_WORKFLOW_RUN,
      variables: { objectRecordId: 'run-1' },
      data: {
        workflowRun: {
          __typename: 'WorkflowRun',
          id: 'run-1',
          status: 'RUNNING',
          stepLogs: null,
          updatedAt: '2026-10-13T10:00:03.000Z',
        },
      },
    });

    expect(await queryWorkflowRun({ client })).toMatchObject({
      status: 'RUNNING',
      stepLogs: null,
    });
  });

  it('should let a newer run response through', async () => {
    const { client } = setup({
      response: {
        workflowRun: {
          __typename: 'WorkflowRun',
          id: 'run-1',
          status: 'FAILED',
          stepLogs: { 'step-1': 'failed' },
          updatedAt: '2026-10-13T10:00:03.000Z',
        },
      },
    });

    expect(await queryWorkflowRun({ client })).toMatchObject({
      status: 'FAILED',
    });
  });

  it('should leave other objects untouched', async () => {
    const { client } = setup({
      response: {
        company: {
          __typename: 'Company',
          id: 'company-1',
          name: 'Apple Inc',
          updatedAt: RUNNING_AT,
        },
      },
    });

    const { data } = await client.query<{
      company: Record<string, unknown>;
    }>({
      query: FIND_ONE_COMPANY,
      variables: { objectRecordId: 'company-1' },
      fetchPolicy: 'network-only',
    });

    expect(data?.company.name).toBe('Apple Inc');
  });
});
