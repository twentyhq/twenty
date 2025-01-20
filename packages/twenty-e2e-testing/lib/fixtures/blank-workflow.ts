import { test as base, expect, Locator, Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createWorkflow } from '../requests/create-workflow';
import { deleteWorkflow } from '../requests/delete-workflow';
import { destroyWorkflow } from '../requests/destroy-workflow';

type WorkflowTriggerType =
  | 'record-created'
  | 'record-updated'
  | 'record-deleted'
  | 'manual';

type WorkflowActionType =
  | 'create-record'
  | 'update-record'
  | 'delete-record'
  | 'code'
  | 'send-email';

export class WorkflowVisualizerPage {
  #page: Page;

  workflowId: string;
  workflowName: string;

  readonly addStepButton: Locator;
  readonly workflowStatus: Locator;
  readonly activateWorkflowButton: Locator;
  readonly deactivateWorkflowButton: Locator;
  readonly addTriggerButton: Locator;

  #actionNames: Record<WorkflowActionType, string> = {
    'create-record': 'Create Record',
    'update-record': 'Update Record',
    'delete-record': 'Delete Record',
    code: 'Serverless Function',
    'send-email': 'Send Email',
  };

  #createdActionNames: Record<WorkflowActionType, string> = {
    'create-record': 'Create Record',
    'update-record': 'Update Record',
    'delete-record': 'Delete Record',
    code: 'Code - Serverless Function',
    'send-email': 'Send Email',
  };

  #triggerNames: Record<WorkflowTriggerType, string> = {
    'record-created': 'Record is Created',
    'record-updated': 'Record is Updated',
    'record-deleted': 'Record is Deleted',
    manual: 'Launch manually',
  };

  #createdTriggerNames: Record<WorkflowTriggerType, string> = {
    'record-created': 'Record is Created',
    'record-updated': 'Record is Updated',
    'record-deleted': 'Record is Deleted',
    manual: 'Manual Trigger',
  };

  constructor({ page, workflowName }: { page: Page; workflowName: string }) {
    this.#page = page;
    this.workflowName = workflowName;

    this.addStepButton = page.getByLabel('Add a step');
    this.workflowStatus = page.getByTestId('workflow-visualizer-status');
    this.activateWorkflowButton = page.getByLabel('Activate Workflow', {
      exact: true,
    });
    this.deactivateWorkflowButton = page.getByLabel('Deactivate Workflow', {
      exact: true,
    });
    this.addTriggerButton = page.getByText('Add a Trigger');
  }

  async createOneWorkflow() {
    const id = randomUUID();

    const response = await createWorkflow({
      page: this.#page,
      workflowId: id,
      workflowName: this.workflowName,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.data.createWorkflow.id).toBe(id);

    this.workflowId = id;
  }

  async goToWorkflowVisualizerPage() {
    await this.#page.goto(`/object/workflow/${this.workflowId}`);

    const workflowName = this.#page.getByRole('button', {
      name: this.workflowName,
    });

    await expect(workflowName).toBeVisible();
  }

  async createInitialTrigger(trigger: WorkflowTriggerType) {
    await this.addTriggerButton.click();

    const triggerName = this.#triggerNames[trigger];
    const createdTriggerName = this.#createdTriggerNames[trigger];

    const triggerOption = this.#page.getByText(triggerName);
    await triggerOption.click();

    const triggerNode = this.#page.getByTestId('rf__node-trigger');
    await expect(triggerNode).toHaveClass(/selected/);
    await expect(triggerNode).toContainText(createdTriggerName);
  }

  async createStep(action: WorkflowActionType) {
    await this.addStepButton.click();

    const actionNames = this.#actionNames[action];
    const createdActionNames = this.#createdActionNames[action];

    const actionToCreateOption = this.#page.getByText(actionNames);
    await actionToCreateOption.click();

    await expect(
      this.#page.getByTestId('command-menu').getByRole('textbox').first(),
    ).toHaveValue(createdActionNames);

    const createdActionNode = this.#page
      .locator('.react-flow__node.selected')
      .getByText(createdActionNames);

    await expect(createdActionNode).toBeVisible();

    const selectedNodes = this.#page.locator('.react-flow__node.selected');

    await expect(async () => {
      expect(await selectedNodes.count()).toBe(1);
    }).toPass();
  }
}

export const test = base.extend<{ workflowVisualizer: WorkflowVisualizerPage }>(
  {
    workflowVisualizer: async ({ page }, use) => {
      const workflowVisualizer = new WorkflowVisualizerPage({
        page,
        workflowName: 'Test Workflow',
      });

      await workflowVisualizer.createOneWorkflow();
      await workflowVisualizer.goToWorkflowVisualizerPage();

      await use(workflowVisualizer);

      await deleteWorkflow({
        page,
        workflowId: workflowVisualizer.workflowId,
      });
      await destroyWorkflow({
        page,
        workflowId: workflowVisualizer.workflowId,
      });
    },
  },
);
