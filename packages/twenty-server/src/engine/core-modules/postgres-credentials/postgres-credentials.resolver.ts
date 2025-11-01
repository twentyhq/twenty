import { UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { PostgresCredentialsDTO } from 'src/engine/core-modules/postgres-credentials/dtos/postgres-credentials.dto';
import { PostgresCredentialsService } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL),
)
@Resolver(() => PostgresCredentialsDTO)
export class PostgresCredentialsResolver {
  constructor(
    private readonly postgresCredentialsService: PostgresCredentialsService,
  ) {}

  @Mutation(() => PostgresCredentialsDTO)
  async enablePostgresProxy(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.postgresCredentialsService.enablePostgresProxy(workspaceId);
  }

  @Mutation(() => PostgresCredentialsDTO)
  async disablePostgresProxy(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.postgresCredentialsService.disablePostgresProxy(workspaceId);
  }

  @Query(() => PostgresCredentialsDTO, { nullable: true })
  async getPostgresCredentials(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.postgresCredentialsService.getPostgresCredentials(workspaceId);
  }
}
