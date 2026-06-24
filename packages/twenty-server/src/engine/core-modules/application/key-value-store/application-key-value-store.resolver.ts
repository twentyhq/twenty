import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AppKeyValueObjectDto } from 'src/engine/core-modules/application/key-value-store/dtos/app-key-value.object';
import { SetAppKeyValueInput } from 'src/engine/core-modules/application/key-value-store/dtos/set-app-key-value.input';
import { ApplicationKeyValueStoreService } from 'src/engine/core-modules/application/key-value-store/services/application-key-value-store.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@MetadataResolver()
export class ApplicationKeyValueStoreResolver {
  constructor(
    private readonly keyValueStoreService: ApplicationKeyValueStoreService,
  ) {}

  @Query(() => AppKeyValueObjectDto, { nullable: true })
  async appKeyValue(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('key') key: string,
  ): Promise<AppKeyValueObjectDto | null> {
    return this.keyValueStoreService.get(
      { applicationId: application.id, workspaceId: workspace.id },
      key,
    );
  }

  @Mutation(() => Boolean)
  async setAppKeyValue(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('input') input: SetAppKeyValueInput,
  ): Promise<boolean> {
    await this.keyValueStoreService.set(
      { applicationId: application.id, workspaceId: workspace.id },
      input.key,
      input.value,
      input.ttlInSeconds,
    );

    return true;
  }

  @Mutation(() => Boolean)
  async deleteAppKeyValue(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('key') key: string,
  ): Promise<boolean> {
    await this.keyValueStoreService.delete(
      { applicationId: application.id, workspaceId: workspace.id },
      key,
    );

    return true;
  }
}
