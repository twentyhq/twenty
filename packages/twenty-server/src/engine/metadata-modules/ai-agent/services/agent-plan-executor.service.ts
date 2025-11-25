import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/ai-agent/types/recordIdsByObjectMetadataNameSingular.type';
import { type PlanStep } from 'src/engine/metadata-modules/ai-router/types/router-result.interface';
import { standardAgentDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents';

import { AgentExecutionService } from './agent-execution.service';

export type PlanExecutionProgress = {
  type: 'plan-generated' | 'step-started' | 'step-completed';
  stepNumber?: number;
  agentName?: string;
  task?: string;
  output?: string;
  totalSteps?: number;
  reasoning?: string;
};

export type StepResult = {
  stepNumber: number;
  agentName: string;
  output: string;
};

export type PlanExecutionResult = {
  finalOutput: string;
  stepResults: StepResult[];
};

@Injectable()
export class AgentPlanExecutorService {
  private readonly logger = new Logger(AgentPlanExecutorService.name);

  constructor(private readonly agentExecutionService: AgentExecutionService) {}

  async executePlan({
    steps,
    reasoning,
    workspace,
    userWorkspaceId,
    recordIdsByObjectMetadataNameSingular,
    onProgress,
    writer,
  }: {
    steps: PlanStep[];
    reasoning: string;
    workspace: WorkspaceEntity;
    userWorkspaceId: string;
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
    onProgress?: (progress: PlanExecutionProgress) => void;
    writer?: {
      write: (chunk: unknown) => void;
      merge: (stream: unknown) => void;
    };
  }): Promise<PlanExecutionResult> {
    this.logger.log(`Executing plan with ${steps.length} steps`);

    onProgress?.({
      type: 'plan-generated',
      totalSteps: steps.length,
      reasoning,
    });

    const stepResults: StepResult[] = [];

    for (const step of steps) {
      try {
        this.logger.log(
          `[PLAN EXECUTION] Step ${step.stepNumber}: Looking up agent "${step.agentName}"`,
        );

        const agent =
          await this.agentExecutionService.agentService.findOneAgent(
            workspace.id,
            { name: step.agentName },
          );

        this.logger.log(
          `[PLAN EXECUTION] Step ${step.stepNumber}: Found agent "${agent.label}" (${agent.id})`,
        );

        onProgress?.({
          type: 'step-started',
          stepNumber: step.stepNumber,
          agentName: step.agentName,
          task: step.task,
        });

        const dependencyOutputs = this.gatherDependencyOutputs(
          step,
          stepResults,
        );

        const promptWithContext = this.buildStepPrompt(step, dependencyOutputs);

        const { stream: stepStream } =
          await this.agentExecutionService.streamChatResponse({
            workspace,
            agentId: agent.id,
            userWorkspaceId,
            messages: [
              {
                id: `step-${step.stepNumber}`,
                role: 'user' as const,
                parts: [{ type: 'text' as const, text: promptWithContext }],
              },
            ],
            recordIdsByObjectMetadataNameSingular,
          });

        let stepOutput = '';

        if (writer) {
          writer.merge(
            stepStream.toUIMessageStream({
              onError: (error) => {
                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
              onFinish: async ({ responseMessage }) => {
                stepOutput = responseMessage.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => {
                    if (part.type === 'text') {
                      return part.text;
                    }

                    return '';
                  })
                  .join('');
              },
            }),
          );

          await stepStream.text;
        } else {
          stepOutput = await stepStream.text;
        }

        stepResults.push({
          stepNumber: step.stepNumber,
          agentName: step.agentName,
          output: stepOutput,
        });

        onProgress?.({
          type: 'step-completed',
          stepNumber: step.stepNumber,
          agentName: step.agentName,
          output: stepOutput,
        });

        this.logger.log(
          `Completed step ${step.stepNumber}: ${step.task.substring(0, 50)}...`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to execute step ${step.stepNumber}: ${step.task}`,
          error,
        );

        throw new Error(
          `Plan execution failed at step ${step.stepNumber}: ${error.message}`,
        );
      }
    }

    const finalOutput = this.synthesizeResults(stepResults, steps);

    return {
      finalOutput,
      stepResults,
    };
  }

  private gatherDependencyOutputs(
    step: PlanStep,
    previousResults: StepResult[],
  ): string {
    if (!step.dependsOn || step.dependsOn.length === 0) {
      return '';
    }

    const dependencyOutputs = step.dependsOn
      .map((depStepNum) => {
        const depResult = previousResults.find(
          (result) => result.stepNumber === depStepNum,
        );

        if (!depResult) {
          throw new Error(
            `Dependency step ${depStepNum} not found for step ${step.stepNumber}`,
          );
        }

        return `Step ${depStepNum} output:\n${depResult.output}`;
      })
      .join('\n\n');

    return dependencyOutputs;
  }

  private buildStepPrompt(step: PlanStep, dependencyOutputs: string): string {
    let prompt = `Task: ${step.task}\n\nExpected output: ${step.expectedOutput}`;

    if (dependencyOutputs) {
      prompt += `\n\nPrevious step results:\n${dependencyOutputs}`;
    }

    return prompt;
  }

  private synthesizeResults(
    stepResults: StepResult[],
    steps: PlanStep[],
  ): string {
    const lastStep = stepResults[stepResults.length - 1];

    if (!lastStep) {
      return 'No results produced';
    }

    const lastStepDefinition = steps.find(
      (s) => s.stepNumber === lastStep.stepNumber,
    );

    if (lastStepDefinition) {
      const agentDefinition = standardAgentDefinitions.find(
        (def) => def.name === lastStepDefinition.agentName,
      );

      if (agentDefinition?.outputStrategy === 'direct') {
        return lastStep.output;
      }
    }

    const summary = stepResults
      .map((result) => {
        const step = steps.find((s) => s.stepNumber === result.stepNumber);

        return `**Step ${result.stepNumber}: ${step?.task || 'Unknown task'}**\n${result.output}`;
      })
      .join('\n\n---\n\n');

    return summary;
  }
}
