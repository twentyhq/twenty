import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/application/application-variable/application-variable-exception-filter';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/application/application-variable/dtos/update-application-variable.input';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveTargetApplicationOrThrow } from 'src/engine/core-modules/application/utils/resolve-target-application-or-throw.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@MetadataResolver(() => ApplicationVariableEntityDTO)
@UseFilters(
  ApplicationVariableEntityExceptionFilter,
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class ApplicationVariableEntityResolver {
  constructor(
    private readonly applicationVariableService: ApplicationVariableEntityService,
  ) {}

  @ResolveField(() => String)
  value(@Parent() applicationVariable: ApplicationVariableEntity): string {
    return this.applicationVariableService.getDisplayValue(applicationVariable);
  }

  @Mutation(() => Boolean)
  async updateOneApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableEntityInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    const { targetApplicationId } = resolveTargetApplicationOrThrow({
      callingApplication,
      applicationId,
    });

    // Without a universal identifier the lookup always carries an id
    assertIsDefinedOrThrow(targetApplicationId);

    await this.applicationVariableService.update({
      key,
      plainTextValue: value,
      applicationId: targetApplicationId,
      workspaceId,
    });

    return true;
  }
}
