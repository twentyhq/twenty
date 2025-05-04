import { Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { UseGuards, UseFilters } from '@nestjs/common';

import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

import { ExternalEventTokenService } from './services/external-event-token.service';

/**
 * Response type for the createExternalEventToken mutation
 */
@ObjectType()
class ExternalEventTokenOutput {
  @Field(() => String, {
    description: 'The token to use for external event API authentication',
  })
  token: string;

  @Field(() => Date, {
    description: 'When this token will expire',
  })
  expiresAt: Date;
}

/**
 * GraphQL resolver for external event tokens
 */
@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ExternalEventResolver {
  constructor(
    private readonly externalEventTokenService: ExternalEventTokenService,
  ) {}

  /**
   * Creates a new external event token for the current user and workspace
   * The token is only returned once and cannot be retrieved later
   */
  @Mutation(() => ExternalEventTokenOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async createExternalEventToken(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ExternalEventTokenOutput> {
    return await this.externalEventTokenService.createToken(
      user.id,
      workspace.id,
    );
  }
}
