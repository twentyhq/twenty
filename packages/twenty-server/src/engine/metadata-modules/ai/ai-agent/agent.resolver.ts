import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';

import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { fromFlatAgentWithRoleIdToAgentDto } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-agent-dto.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceAiDataPolicyService } from 'src/engine/metadata-modules/ai/ai-models/services/workspace-ai-data-policy.service';
import { IS_CUSTOM_DEPRECATION_REASON } from 'src/engine/metadata-modules/utils/constants/is-custom-deprecation-reason.constant';

import { AgentService } from './agent.service';

import { AgentIdInput } from './dtos/agent-id.input';
import { AgentDTO } from './dtos/agent.dto';
import { CreateAgentInput } from './dtos/create-agent.input';
import { UpdateAgentInput } from './dtos/update-agent.input';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { AGENT_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-read-access-policy.constant';
import { AGENT_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-write-access-policy.constant';

@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  AiGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => AgentDTO)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
export class AgentResolver {
  constructor(
    private readonly agentService: AgentService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly workspaceAiDataPolicyService: WorkspaceAiDataPolicyService,
  ) {}

  @ResolveField(() => Boolean, {
    deprecationReason: IS_CUSTOM_DEPRECATION_REASON,
  })
  isCustom(
    @Parent() agent: AgentDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): boolean {
    return agent.applicationId === workspace.workspaceCustomApplicationId;
  }

  @Query(() => [AgentDTO])
  @UseGuards(AccessPolicyGuard(AGENT_READ_ACCESS_POLICY))
  async findManyAgents(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<AgentDTO[]> {
    const flatAgentsWithRoleId =
      await this.agentService.findManyAgents(workspaceId);

    return flatAgentsWithRoleId
      .filter((flatAgent) =>
        canCallerReachApplication({
          callingApplication,
          applicationId: flatAgent.applicationId,
          operation: 'read',
          workspaceCustomApplicationId,
        }),
      )
      .map(fromFlatAgentWithRoleIdToAgentDto);
  }

  @Query(() => AgentDTO)
  @UseGuards(
    AccessPolicyGuard(AGENT_READ_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  async findOneAgent(
    @ApplicationTargetArg<AgentIdInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'agent',
      idKey: 'id',
      requireApplicationRegistrationOwnership: false,
    })
    { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO> {
    const fatAgentWithRoleId = await this.agentService.findOneAgentById({
      workspaceId,
      id,
    });

    return fromFlatAgentWithRoleIdToAgentDto(fatAgentWithRoleId);
  }

  @Mutation(() => AgentDTO)
  @UseGuards(AccessPolicyGuard(AGENT_WRITE_ACCESS_POLICY))
  async createOneAgent(
    @Args('input') input: CreateAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentDTO> {
    if (isNonEmptyString(input.modelId)) {
      this.aiModelRegistryService.validateModelAvailabilityOrThrow({
        modelId: input.modelId,
        aiDataPolicy:
          await this.workspaceAiDataPolicyService.getEffectiveAiDataPolicy(
            workspace,
          ),
      });
    }

    const createdAgent = await this.agentService.createOneAgent(
      input,
      workspace.id,
    );

    return fromFlatAgentWithRoleIdToAgentDto(createdAgent);
  }

  @Mutation(() => AgentDTO)
  @UseGuards(
    AccessPolicyGuard(AGENT_WRITE_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  async updateOneAgent(
    @ApplicationTargetArg<UpdateAgentInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'agent',
      idKey: 'id',
      requireApplicationRegistrationOwnership: false,
    })
    input: UpdateAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentDTO> {
    if (isNonEmptyString(input.modelId)) {
      this.aiModelRegistryService.validateModelAvailabilityOrThrow({
        modelId: input.modelId,
        aiDataPolicy:
          await this.workspaceAiDataPolicyService.getEffectiveAiDataPolicy(
            workspace,
          ),
      });
    }

    const updatedAgent = await this.agentService.updateOneAgent({
      input,
      workspaceId: workspace.id,
    });

    return fromFlatAgentWithRoleIdToAgentDto(updatedAgent);
  }

  @Mutation(() => AgentDTO)
  @UseGuards(
    AccessPolicyGuard(AGENT_WRITE_ACCESS_POLICY),
    ApplicationTargetGuard,
  )
  async deleteOneAgent(
    @ApplicationTargetArg<AgentIdInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'agent',
      idKey: 'id',
      requireApplicationRegistrationOwnership: false,
    })
    { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO> {
    const deletedFlatAgent = await this.agentService.deleteOneAgent(
      id,
      workspaceId,
    );

    return fromFlatAgentWithRoleIdToAgentDto(deletedFlatAgent);
  }
}
