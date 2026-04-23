import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { type StepIfElseBranch } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const client = request(`http://localhost:${APP_PORT}`);

describe('If/Else Workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let ifElseStepId: string | null = null;
  let ifBranchEmptyNodeId: string | null = null;
  let elseBranchEmptyNodeId: string | null = null;
  let elseIfBranchEmptyNodeId: string | null = null;
  let elseIfBranchId: string | null = null;

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: {
              name: "If/Else Test Workflow"
            }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
              id
              versions {
                edges {
                  node {
                    id
                    status
                  }
                }
              }
            }
          }
        `,
        variables: { id: createdWorkflowId },
      });

    expect(getWorkflowResponse.body.errors).toBeUndefined();
    expect(
      getWorkflowResponse.body.data.workflow.versions.edges.length,
    ).toBeGreaterThan(0);
    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    const manualTrigger = {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: {
        outputSchema: {
          number: {
            isLeaf: true,
            type: 'number',
            value: undefined,
          },
        },
      },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    };

    const updateWorkflowVersionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersion($id: UUID!, $data: WorkflowVersionUpdateInput!) {
            updateWorkflowVersion(id: $id, data: $data) {
              id
              trigger
            }
          }
        `,
        variables: {
          id: createdWorkflowVersionId,
          data: {
            trigger: manualTrigger,
          },
        },
      });

    expect(updateWorkflowVersionResponse.body.errors).toBeUndefined();

    const createIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'IF_ELSE',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createIfElseStepResponse.body.errors).toBeUndefined();

    const getWorkflowVersionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              id
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    expect(getWorkflowVersionResponse.body.errors).toBeUndefined();
    const steps = getWorkflowVersionResponse.body.data.workflowVersion.steps;
    const ifElseStep = steps.find(
      (step: { type: string }) => step.type === 'IF_ELSE',
    );

    expect(ifElseStep).toBeDefined();
    ifElseStepId = ifElseStep.id;

    const branches = ifElseStep.settings.input.branches;
    const ifBranch = branches.find(
      (branch: StepIfElseBranch) => branch.filterGroupId,
    );
    const elseBranch = branches.find(
      (branch: StepIfElseBranch) => !branch.filterGroupId,
    );

    expect(ifBranch).toBeDefined();
    expect(elseBranch).toBeDefined();
    expect(ifBranch.nextStepIds.length).toBeGreaterThan(0);
    expect(elseBranch.nextStepIds.length).toBeGreaterThan(0);

    ifBranchEmptyNodeId = ifBranch.nextStepIds[0];
    elseBranchEmptyNodeId = elseBranch.nextStepIds[0];

    expect(ifElseStep.settings.input.stepFilterGroups.length).toBeGreaterThan(
      0,
    );
    expect(ifElseStep.settings.input.stepFilters.length).toBeGreaterThan(0);
    expect(ifElseStep.settings.input.branches.length).toBe(2);

    const ifFilterGroupId = ifBranch.filterGroupId;

    expect(ifFilterGroupId).toBeDefined();

    const filterGroup = ifElseStep.settings.input.stepFilterGroups.find(
      (g: { id: string }) => g.id === ifFilterGroupId,
    );

    expect(filterGroup).toBeDefined();

    const updateIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
              type
              name
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step: {
              ...ifElseStep,
              settings: {
                ...ifElseStep.settings,
                input: {
                  ...ifElseStep.settings.input,
                  stepFilters: [
                    {
                      id: ifElseStep.settings.input.stepFilters[0].id,
                      type: 'NUMBER',
                      stepOutputKey: '{{trigger.number}}',
                      operand: ViewFilterOperand.IS,
                      value: '10',
                      stepFilterGroupId: ifFilterGroupId,
                      positionInStepFilterGroup: 0,
                    },
                  ],
                },
              },
            },
          },
        },
      });

    expect(updateIfElseStepResponse.body.errors).toBeUndefined();

    const createEmptyNodeResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'EMPTY',
            parentStepId: undefined,
            position: { x: 300, y: 100 },
          },
        },
      });

    expect(createEmptyNodeResponse.body.errors).toBeUndefined();

    const getUpdatedWorkflowVersionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              id
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    const updatedSteps =
      getUpdatedWorkflowVersionResponse.body.data.workflowVersion.steps;
    const newEmptyNodes = updatedSteps.filter(
      (step: { type: string }) => step.type === 'EMPTY',
    );
    const newElseIfEmptyNode = newEmptyNodes.find(
      (node: { id: string }) =>
        node.id !== ifBranchEmptyNodeId && node.id !== elseBranchEmptyNodeId,
    );

    expect(newElseIfEmptyNode).toBeDefined();
    elseIfBranchEmptyNodeId = newElseIfEmptyNode.id;

    const elseIfFilterGroupId = v4();
    const elseIfFilterId = v4();

    elseIfBranchId = v4();

    const getCurrentIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              id
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    const currentSteps =
      getCurrentIfElseStepResponse.body.data.workflowVersion.steps;
    const currentIfElseStep = currentSteps.find(
      (step: { id: string }) => step.id === ifElseStepId,
    );

    const updatedBranches = [...currentIfElseStep.settings.input.branches];

    updatedBranches.splice(
      currentIfElseStep.settings.input.branches.length - 1,
      0,
      {
        id: elseIfBranchId,
        filterGroupId: elseIfFilterGroupId,
        nextStepIds: [elseIfBranchEmptyNodeId],
      },
    );

    const updatedStepFilterGroups = [
      ...currentIfElseStep.settings.input.stepFilterGroups,
      {
        id: elseIfFilterGroupId,
        logicalOperator: StepLogicalOperator.AND,
        positionInStepFilterGroup: 0,
      },
    ];

    const updatedStepFilters = [
      ...currentIfElseStep.settings.input.stepFilters,
      {
        id: elseIfFilterId,
        type: 'NUMBER',
        stepOutputKey: '{{trigger.number}}',
        operand: ViewFilterOperand.IS,
        value: '20',
        stepFilterGroupId: elseIfFilterGroupId,
        positionInStepFilterGroup: 0,
      },
    ];

    const updateIfElseStepWithElseIfResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
              type
              name
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step: {
              ...currentIfElseStep,
              settings: {
                ...currentIfElseStep.settings,
                input: {
                  ...currentIfElseStep.settings.input,
                  branches: updatedBranches,
                  stepFilterGroups: updatedStepFilterGroups,
                  stepFilters: updatedStepFilters,
                },
              },
            },
          },
        },
      });

    expect(updateIfElseStepWithElseIfResponse.body.errors).toBeUndefined();

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });
    }
  });

  const identifyBranches = (branches: StepIfElseBranch[]) => {
    const ifBranch = branches[0];
    const elseBranch = branches.find((branch) => !branch.filterGroupId);
    const elseIfBranches = branches.filter(
      (branch, index) =>
        index > 0 &&
        index < branches.length - 1 &&
        branch.filterGroupId !== undefined,
    );

    return { ifBranch, elseBranch, elseIfBranches };
  };

  describe('Workflow structure', () => {
    it('should verify If/Else workflow exists and is active', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflow($id: UUID!) {
              workflow(filter: { id: { eq: $id } }) {
                id
                name
                lastPublishedVersionId
                statuses
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.workflow.id).toBe(createdWorkflowId);
      expect(response.body.data.workflow.name).toBe('If/Else Test Workflow');
      expect(response.body.data.workflow.lastPublishedVersionId).toBe(
        createdWorkflowVersionId,
      );
      expect(response.body.data.workflow.statuses).toContain('ACTIVE');
    });

    it('should verify If/Else workflow version has correct structure', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflowVersion($id: UUID!) {
              workflowVersion(filter: { id: { eq: $id } }) {
                id
                name
                status
                trigger
                steps
              }
            }
          `,
          variables: { id: createdWorkflowVersionId },
        });

      expect(response.body.errors).toBeUndefined();

      const workflowVersion = response.body.data.workflowVersion;

      expect(workflowVersion.status).toBe('ACTIVE');

      const trigger = workflowVersion.trigger;

      expect(trigger.type).toBe('MANUAL');
      expect(trigger.nextStepIds).toContain(ifElseStepId);

      const steps = workflowVersion.steps;

      const ifElseStep = steps.find(
        (step: { id: string }) => step.id === ifElseStepId,
      );

      expect(ifElseStep).toBeDefined();
      expect(ifElseStep.type).toBe('IF_ELSE');
      expect(ifElseStep.name).toBe('If/Else');
      expect(ifElseStep.settings.input.branches.length).toBe(3);

      const { ifBranch, elseBranch, elseIfBranches } = identifyBranches(
        ifElseStep.settings.input.branches,
      );

      expect(ifBranch?.filterGroupId).toBeDefined();
      expect(elseBranch?.filterGroupId).toBeUndefined();
      expect(ifBranch?.nextStepIds).toContain(ifBranchEmptyNodeId);
      expect(elseBranch?.nextStepIds).toContain(elseBranchEmptyNodeId);

      expect(elseIfBranches.length).toBe(1);
      expect(elseIfBranches[0].filterGroupId).toBeDefined();
      expect(elseIfBranches[0].nextStepIds).toContain(elseIfBranchEmptyNodeId);
    });
  });

  describe('If/Else branching execution', () => {
    const getIfElseStepWithBranches = async (): Promise<
      Pick<WorkflowIfElseAction, 'id' | 'settings'>
    > => {
      const getWorkflowVersionResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query GetWorkflowVersion($id: UUID!) {
              workflowVersion(filter: { id: { eq: $id } }) {
                id
                steps
              }
            }
          `,
          variables: { id: createdWorkflowVersionId },
        });

      expect(getWorkflowVersionResponse.body.errors).toBeUndefined();
      const steps = getWorkflowVersionResponse.body.data.workflowVersion.steps;
      const ifElseStep = steps.find(
        (step: { id: string }) => step.id === ifElseStepId,
      ) as WorkflowIfElseAction | undefined;

      expect(ifElseStep).toBeDefined();

      return ifElseStep!;
    };

    const verifyBranchExecution = async ({
      payload,
      expectedBranchType,
    }: {
      payload: { number: number };
      expectedBranchType: 'if' | 'else' | 'else-if';
    }) => {
      const workflowRunId = await runWorkflowVersion({
        workflowVersionId: createdWorkflowVersionId!,
        payload,
      });

      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('COMPLETED');
      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');
      expect(workflowRun?.state?.stepInfos?.[ifElseStepId!]?.status).toBe(
        'SUCCESS',
      );

      const ifElseStepResult = workflowRun?.state?.stepInfos?.[ifElseStepId!]
        ?.result as { matchingBranchId?: string } | undefined;

      expect(ifElseStepResult?.matchingBranchId).toBeDefined();

      const ifElseStep = await getIfElseStepWithBranches();

      const matchedBranch = ifElseStep.settings.input.branches.find(
        (branch) => branch.id === ifElseStepResult?.matchingBranchId,
      );

      if (!matchedBranch) {
        const branchIds = ifElseStep.settings.input.branches.map((b) => b.id);

        throw new Error(
          `Branch with ID ${ifElseStepResult?.matchingBranchId} not found. Available branch IDs: ${branchIds.join(', ')}`,
        );
      }

      const { ifBranch, elseBranch, elseIfBranches } = identifyBranches(
        ifElseStep.settings.input.branches,
      );

      let expectedBranch: StepIfElseBranch | undefined;
      let expectedEmptyNodeId: string | null = null;
      let otherEmptyNodeIds: (string | null)[] = [];

      if (expectedBranchType === 'if') {
        expectedBranch = ifBranch;
        expectedEmptyNodeId = ifBranchEmptyNodeId;
        otherEmptyNodeIds = [elseBranchEmptyNodeId, elseIfBranchEmptyNodeId];
      } else if (expectedBranchType === 'else') {
        expectedBranch = elseBranch;
        expectedEmptyNodeId = elseBranchEmptyNodeId;
        otherEmptyNodeIds = [ifBranchEmptyNodeId, elseIfBranchEmptyNodeId];
      } else if (expectedBranchType === 'else-if') {
        expectedBranch = elseIfBranches.find(
          (branch) => branch.id === elseIfBranchId,
        );
        expectedEmptyNodeId = elseIfBranchEmptyNodeId;
        otherEmptyNodeIds = [ifBranchEmptyNodeId, elseBranchEmptyNodeId];
      }

      expect(matchedBranch.id).toBe(expectedBranch?.id);
      expect(matchedBranch.nextStepIds).toContain(expectedEmptyNodeId);
      otherEmptyNodeIds.forEach((id) => {
        if (id) {
          expect(matchedBranch.nextStepIds).not.toContain(id);
        }
      });

      await destroyWorkflowRun(workflowRunId);
    };

    it('should execute IF branch when condition is true', async () => {
      await verifyBranchExecution({
        payload: { number: 10 },
        expectedBranchType: 'if',
      });
    });

    it('should execute ELSE branch when condition is false', async () => {
      await verifyBranchExecution({
        payload: { number: 5 },
        expectedBranchType: 'else',
      });
    });

    it('should execute ELSE-IF branch when condition is true', async () => {
      await verifyBranchExecution({
        payload: { number: 20 },
        expectedBranchType: 'else-if',
      });
    });
  });
});
