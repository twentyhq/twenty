import { test as base, expect, Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createWorkflow } from '../requests/create-workflow';
import { deleteWorkflow } from '../requests/delete-workflow';
import { destroyWorkflow } from '../requests/destroy-workflow';

export class WorkflowVisualizerPage {
  #page: Page;

  workflowId: string;
  workflowName: string;

  constructor({ page, workflowName }: { page: Page; workflowName: string }) {
    this.#page = page;
    this.workflowName = workflowName;
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
