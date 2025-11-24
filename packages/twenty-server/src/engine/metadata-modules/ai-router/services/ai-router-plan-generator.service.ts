import { Injectable, Logger } from '@nestjs/common';

import {
  generateObject,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { z } from 'zod';

import {
  DEFAULT_SMART_MODEL,
  type ModelId,
} from 'src/engine/metadata-modules/ai-models/constants/ai-models.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai-models/services/ai-model-registry.service';
import { type AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import { type ExecutionPlan } from 'src/engine/metadata-modules/ai-router/types/router-result.interface';

@Injectable()
export class AiRouterPlanGeneratorService {
  private readonly logger = new Logger(AiRouterPlanGeneratorService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async generatePlan({
    messages,
    availableAgents,
    agentDescriptions,
    smartModel,
  }: {
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    availableAgents: AgentEntity[];
    agentDescriptions: string;
    smartModel: ModelId;
  }): Promise<ExecutionPlan> {
    const model = this.getSmartModel(smartModel);
    const agentNames = availableAgents.map((agent) => agent.name);

    const conversationHistory = messages
      .slice(0, -1)
      .map((msg) => {
        const textContent =
          msg.parts.find((part) => part.type === 'text')?.text || '';

        return `${msg.role}: ${textContent}`;
      })
      .join('\n');

    const currentMessage =
      messages[messages.length - 1]?.parts.find((part) => part.type === 'text')
        ?.text || '';

    const systemPrompt = `You are an AI planner that creates execution plans for multi-agent tasks.

Available agents:
${agentDescriptions}

Create a step-by-step execution plan. Each step should:
- Assign to the most appropriate agent
- Have a clear, specific task
- Specify expected output
- List dependencies on previous steps (if any)

Keep plans focused and efficient.`;

    const userPrompt = `${conversationHistory ? `Conversation history:\n${conversationHistory}\n\n` : ''}Current request:\n${currentMessage}\n\nCreate a detailed execution plan with specific steps.`;

    const planStepSchema = z.object({
      stepNumber: z.number().describe('Step number in execution order'),
      agentName: z
        .enum([agentNames[0], ...agentNames.slice(1)])
        .describe('Agent name to execute this step'),
      task: z.string().describe('Specific task for this agent'),
      expectedOutput: z.string().describe('Expected output from this step'),
      dependsOn: z
        .array(z.number())
        .optional()
        .describe('Step numbers this step depends on'),
    });

    const planSchema = z.object({
      steps: z.array(planStepSchema).describe('Execution steps in order'),
      reasoning: z.string().describe('Why multi-agent planning is needed'),
    });

    const PLANNER_TEMPERATURE = 0.1;

    const result = await generateObject({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      schema: planSchema,
      temperature: PLANNER_TEMPERATURE,
      experimental_telemetry: AI_TELEMETRY_CONFIG,
    });

    this.logger.log(
      `[PLANNER] Generated plan with ${result.object.steps.length} steps`,
    );

    this.validatePlan(result.object);

    return result.object as ExecutionPlan;
  }

  private validatePlan(plan: ExecutionPlan): void {
    const stepNumbers = new Set(plan.steps.map((s) => s.stepNumber));

    for (const step of plan.steps) {
      this.validateStepDependencies(step, stepNumbers);
    }

    this.logger.log(`[PLANNER] Plan validation passed`);
  }

  private validateStepDependencies(
    step: { stepNumber: number; dependsOn?: number[] },
    validStepNumbers: Set<number>,
  ): void {
    if (!step.dependsOn) {
      return;
    }

    this.checkForSelfDependency(step);

    for (const dependency of step.dependsOn) {
      this.validateDependencyExists(dependency, validStepNumbers);
      this.validateDependencyOrder(step.stepNumber, dependency);
    }
  }

  private checkForSelfDependency(step: {
    stepNumber: number;
    dependsOn?: number[];
  }): void {
    if (step.dependsOn?.includes(step.stepNumber)) {
      throw new Error(`Step ${step.stepNumber} cannot depend on itself`);
    }
  }

  private validateDependencyExists(
    dependency: number,
    validStepNumbers: Set<number>,
  ): void {
    if (!validStepNumbers.has(dependency)) {
      throw new Error(`Invalid dependency: step ${dependency} not found`);
    }
  }

  private validateDependencyOrder(
    currentStepNumber: number,
    dependency: number,
  ): void {
    if (dependency >= currentStepNumber) {
      throw new Error(
        `Step ${currentStepNumber} depends on future step ${dependency}`,
      );
    }
  }

  private getSmartModel(modelId: ModelId) {
    if (modelId === DEFAULT_SMART_MODEL) {
      return this.getDefaultSmartModel();
    }

    return this.getSpecificSmartModel(modelId);
  }

  private getDefaultSmartModel() {
    const registeredModel =
      this.aiModelRegistryService.getDefaultPerformanceModel();

    if (!registeredModel) {
      throw new Error('No smart model available');
    }

    return registeredModel.model;
  }

  private getSpecificSmartModel(modelId: ModelId) {
    const registeredModel = this.aiModelRegistryService.getModel(modelId);

    if (!registeredModel) {
      throw new Error(`Smart model "${modelId}" not available`);
    }

    return registeredModel.model;
  }
}
