import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Query } from '@nestjs/graphql';

import { PostgresCredentialsDTO } from 'src/engine/core-modules/postgres-credentials/dtos/postgres-credentials.dto';
import { PostgresCredentialsService } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

@Resolver(() => PostgresCredentialsDTO)
export class PostgresCredentialsResolver {
  constructor(
    private readonly postgresCredentialsService: PostgresCredentialsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => PostgresCredentialsDTO)
  async enablePostgresProxy(@AuthWorkspace() { id: workspaceId }: Workspace) {
    return this.postgresCredentialsService.enablePostgresProxy(workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => PostgresCredentialsDTO)
  async disablePostgresProxy(@AuthWorkspace() { id: workspaceId }: Workspace) {
    return this.postgresCredentialsService.disablePostgresProxy(workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => PostgresCredentialsDTO, { nullable: true })
  async getPostgresCredentials(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.postgresCredentialsService.getPostgresCredentials(workspaceId);
  }
}
