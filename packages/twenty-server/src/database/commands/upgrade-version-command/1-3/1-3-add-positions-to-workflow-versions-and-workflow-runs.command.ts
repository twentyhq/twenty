import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import Dagre from '@dagrejs/dagre';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

type Diagram = {
  nodes: {
    id: string;
    position: { x: number; y: number };
    measured?: { width: number; height: number };
  }[];
  edges: { id: string; source: string; target: string }[];
};

@Command({
  name: 'upgrade:1-3:add-positions-to-workflow-versions-and-workflow-runs',
  description: 'Add positions to workflow versions and workflow runs',
})
export class AddPositionsToWorkflowVersionsAndWorkflowRuns extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.addPositionsToWorkflowVersions({ workspaceId });
    await this.addPositionsToWorkflowRuns({ workspaceId });
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

    for (const workflowVersion of workflowVersions) {
      try {
        const { updatedTrigger, updatedSteps } =
          this.getOrganizedStepsAndTrigger({
            trigger: workflowVersion.trigger,
            steps: workflowVersion.steps,
          });

        await workflowVersionRepository.update(workflowVersion.id, {
          trigger: updatedTrigger,
          steps: updatedSteps,
        });
      } catch (error) {
        this.logger.error(
          `Error while adding positions to workflowVersion '${workflowVersion.id}'`,
          error,
        );
      }
    }

    this.logger.log(
      `Workflow versions updated count: ${workflowVersions.length}`,
    );
  }

  private async addPositionsToWorkflowRuns({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const workflowRuns = await mainDataSource.query(
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

        await mainDataSource.query(
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
    const nodes: { id: string; position: { x: number; y: number } }[] = [];

    const edges: { id: string; source: string; target: string }[] = [];

    nodes.push({ id: 'trigger', position: { x: 0, y: 0 } });

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
    }

    for (const step of steps || []) {
      nodes.push({
        id: step.id,
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
        width: 120,
        height: 42,
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
