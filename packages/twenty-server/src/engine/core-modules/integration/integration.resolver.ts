import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import {
  IntegrationService,
  IntegrationConfig,
} from './services/integration.service';
import { IntegrationProvider } from './enums/integration-provider.enum';

// --- DTOs ---

@ObjectType()
class IntegrationStatusDTO {
  @Field() provider: string;
  @Field() connected: boolean;
  @Field({ nullable: true }) error: string;
}

@InputType()
class ConnectIntegrationInput {
  @Field(() => String) provider: string;
  @Field({ nullable: true }) apiKey: string;
  @Field({ nullable: true }) apiSecret: string;
  @Field({ nullable: true }) accessToken: string;
  @Field({ nullable: true }) refreshToken: string;
  @Field({ nullable: true }) webhookUrl: string;
}

// --- Resolver ---

@MetadataResolver(() => 'Integration')
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class IntegrationResolver {
  constructor(private readonly integrationService: IntegrationService) {}

  @Mutation(() => Boolean)
  async connect(
    @Args('input') input: ConnectIntegrationInput,
  ): Promise<boolean> {
    const config: IntegrationConfig = {
      provider: input.provider as IntegrationProvider,
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      webhookUrl: input.webhookUrl,
    };

    await this.integrationService.connect(config);

    return true;
  }

  @Mutation(() => Boolean)
  async disconnect(
    @Args('provider') provider: string,
  ): Promise<boolean> {
    await this.integrationService.disconnect(
      provider as IntegrationProvider,
    );

    return true;
  }

  @Query(() => Boolean)
  async testConnection(
    @Args('input') input: ConnectIntegrationInput,
  ): Promise<boolean> {
    const config: IntegrationConfig = {
      provider: input.provider as IntegrationProvider,
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      webhookUrl: input.webhookUrl,
    };

    return this.integrationService.testConnection(config);
  }

  @Query(() => IntegrationStatusDTO)
  async getStatus(
    @Args('provider') provider: string,
  ): Promise<IntegrationStatusDTO> {
    try {
      const config: IntegrationConfig = {
        provider: provider as IntegrationProvider,
      };
      const connected =
        await this.integrationService.testConnection(config);

      return { provider, connected, error: null as unknown as string };
    } catch (error) {
      return {
        provider,
        connected: false,
        error: (error as Error).message,
      };
    }
  }
}
