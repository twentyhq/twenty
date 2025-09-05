import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import Dagre from '@dagrejs/dagre';
import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type Node = {
  id: string;
  position: { x: number; y: number };
  size: number;
  measured?: { width: number; height: number };
};

type Edge = { id: string; source: string; target: string };

type Diagram = {
  nodes: Node[];
  edges: Edge[];
};

export type AddPositionsToWorkflowVersionsAndWorkflowRunsOptions =
  ActiveOrSuspendedWorkspacesMigrationCommandOptions & {
    processWorkflowRuns?: boolean;
  };

@Command({
  name: 'upgrade:1-5:add-positions-to-workflow-versions-and-workflow-runs',
  description: 'Add positions to workflow versions and workflow runs',
})
export class AddPositionsToWorkflowVersionsAndWorkflowRunsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  @Option({
    flags: '--process-workflow-runs [process_workflow_runs]',
    description: 'Process workflowRuns positions (default false)',
    required: false,
  })
  parseProcessWorkflowRuns(): boolean {
    return true;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: Omit<RunOnWorkspaceArgs, 'options'> & {
    options: AddPositionsToWorkflowVersionsAndWorkflowRunsOptions;
  }): Promise<void> {
    await this.addPositionsToWorkflowVersions({ workspaceId });

    if (options.processWorkflowRuns) {
      await this.addPositionsToWorkflowRuns({ workspaceId });
    }
  }

  private async addPositionsToWorkflowVersions({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find();

    let count = 0;

    for (const workflowVersion of workflowVersions) {
      try {
        // We only update one branch workflow
        if (this.isWorkflowMultiBranch(workflowVersion)) {
          continue;
        }

        const { updatedTrigger, updatedSteps } =
          this.getOrganizedStepsAndTrigger({
            trigger: workflowVersion.trigger,
            steps: workflowVersion.steps,
          });

        await workflowVersionRepository.update(workflowVersion.id, {
          trigger: updatedTrigger,
          steps: updatedSteps,
        });
        count += 1;
      } catch (error) {
        this.logger.error(
          `Error while adding positions to workflowVersion '${workflowVersion.id}'`,
          error,
        );
      }
    }

    this.logger.log(
      `Workflow versions updated count: ${count} out of ${workflowVersions.length}`,
    );
  }

  private isWorkflowMultiBranch(
    workflowVersion: WorkflowVersionWorkspaceEntity,
  ) {
    if ((workflowVersion.trigger?.nextStepIds ?? []).length > 1) {
      return true;
    }

    for (const step of workflowVersion.steps || []) {
      if ((step.nextStepIds ?? []).length > 1) {
        return true;
      }
    }

    return false;
  }

  private async addPositionsToWorkflowRuns({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const workflowRuns = await this.coreDataSource.query(
      `SELECT id, state FROM ${schemaName}."workflowRun"`,
    );

    for (const workflowRun of workflowRuns) {
      try {
        const { updatedTrigger, updatedSteps } =
          this.getOrganizedStepsAndTrigger({
            trigger: workflowRun.state.flow.trigger,
            steps: workflowRun.state.flow.steps,
          });

        const updatedState = {
          ...workflowRun.state,
          flow: {
            ...workflowRun.state.flow,
            trigger: updatedTrigger,
            steps: updatedSteps,
          },
        };

        await this.coreDataSource.query(
          `UPDATE ${schemaName}."workflowRun" SET state = $1::jsonb WHERE id = $2`,
          [updatedState, workflowRun.id],
        );
      } catch (error) {
        this.logger.error(
          `Error while adding positions to workflowRuns '${workflowRun.id}'`,
          error,
        );
      }
    }
  }

  private getNodePositionFromDiagram({
    stepId,
    diagram,
  }: {
    stepId: string;
    diagram: Diagram;
  }) {
    return diagram.nodes.find((node) => node.id === stepId)?.position;
  }

  private createWorkflowDiagram({
    trigger,
    steps,
  }: {
    trigger?: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Diagram {
    const nodes: Node[] = [];

    const edges: Edge[] = [];

    if (!isDefined(trigger)) {
      const triggerNextStepIds = isDefined(steps)
        ? this.getRootSteps(steps).map((step) => step.id)
        : [];

      triggerNextStepIds.forEach((stepId: string) => {
        edges.push({
          id: v4(),
          source: 'trigger',
          target: stepId,
        });
      });
      nodes.push({ id: 'trigger', size: 13, position: { x: 0, y: 0 } });
    } else {
      nodes.push({
        id: 'trigger',
        size: Math.min(trigger.name.length, 29),
        position: { x: 0, y: 0 },
      });
    }

    for (const step of steps || []) {
      nodes.push({
        id: step.id,
        size: Math.min(step.name.length, 29),
        position: { x: 0, y: 0 },
      });

      step.nextStepIds?.forEach((nextStepId) => {
        edges.push({
          id: v4(),
          source: step.id,
          target: nextStepId,
        });
      });
    }

    for (const stepId of trigger?.nextStepIds || []) {
      edges.push({
        id: v4(),
        source: 'trigger',
        target: stepId,
      });
    }

    return {
      nodes,
      edges,
    };
  }

  private getOrganizedStepsAndTrigger({
    trigger,
    steps,
  }: {
    trigger?: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }) {
    const workflowDiagram = this.createWorkflowDiagram({ steps, trigger });

    const organizedDiagram = this.getOrganizedDiagram(workflowDiagram);

    const updatedTrigger: WorkflowTrigger | undefined = isDefined(trigger)
      ? {
          ...trigger,
          position: this.getNodePositionFromDiagram({
            stepId: 'trigger',
            diagram: organizedDiagram,
          }),
        }
      : undefined;

    const updatedSteps: WorkflowAction[] = (steps || []).map(
      (step: WorkflowAction) => ({
        ...step,
        position: this.getNodePositionFromDiagram({
          stepId: step.id,
          diagram: organizedDiagram,
        }),
      }),
    );

    return {
      updatedTrigger,
      updatedSteps,
    };
  }

  private getRootSteps(steps: WorkflowAction[]): WorkflowAction[] {
    const childIds = new Set<string>();

    for (const step of steps) {
      step.nextStepIds?.forEach((id) => childIds.add(id));
    }

    return steps.filter((step) => !childIds.has(step.id));
  }

  private getOrganizedDiagram(diagram: Diagram): Diagram {
    const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
      ranksep: 80, // Vertical distance between 2 nodes
      nodesep: 200, // Horizontal distance between 2 nodes
      rankdir: 'TB',
    });

    diagram.edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
    diagram.nodes.forEach((node) =>
      graph.setNode(node.id, {
        width: node.size * 6,
        height: 50,
      }),
    );

    Dagre.layout(graph);

    return {
      nodes: diagram.nodes.map((node) => {
        const position = graph.node(node.id);

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        const x = position.x - position.width / 2;
        const y = position.y - position.height / 2;

        return { ...node, position: { x, y } };
      }),
      edges: diagram.edges,
    };
  }
}
