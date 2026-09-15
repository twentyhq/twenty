import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { type AppKeyValue } from 'twenty-shared/application';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { AppKeyValueDto } from 'src/engine/core-modules/application/application-key-value/dtos/app-key-value.dto';
import { SetAppKeyValueInput } from 'src/engine/core-modules/application/application-key-value/dtos/set-app-key-value.input';
import { AppKeyValueScope } from 'src/engine/core-modules/application/application-key-value/enums/app-key-value-scope.enum';
import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(ApplicationExceptionFilter)
@MetadataResolver()
export class ApplicationKeyValueResolver {
  constructor(
    private readonly applicationKeyValueService: ApplicationKeyValueService,
  ) {}

  @Query(() => AppKeyValueDto, { nullable: true })
  async appKeyValue(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('key') key: string,
    @Args('scope', {
      type: () => AppKeyValueScope,
      nullable: true,
      defaultValue: AppKeyValueScope.WORKSPACE,
    })
    scope: AppKeyValueScope,
  ): Promise<AppKeyValue | null> {
    return this.applicationKeyValueService.get({
      application,
      workspaceId: workspace.id,
      key,
      scope,
    });
  }

  @Mutation(() => AppKeyValueDto)
  async setAppKeyValue(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('input') input: SetAppKeyValueInput,
  ): Promise<AppKeyValue> {
    return this.applicationKeyValueService.set({
      application,
      workspaceId: workspace.id,
      key: input.key,
      value: input.value,
      scope: input.scope ?? AppKeyValueScope.WORKSPACE,
    });
  }

  @Mutation(() => Boolean)
  async deleteAppKeyValue(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('key') key: string,
    @Args('scope', {
      type: () => AppKeyValueScope,
      nullable: true,
      defaultValue: AppKeyValueScope.WORKSPACE,
    })
    scope: AppKeyValueScope,
  ): Promise<boolean> {
    return this.applicationKeyValueService.delete({
      application,
      workspaceId: workspace.id,
      key,
      scope,
    });
  }
}
