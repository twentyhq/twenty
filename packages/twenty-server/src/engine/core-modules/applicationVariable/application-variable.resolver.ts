import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/applicationVariable/application-variable-exception-filter';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/applicationVariable/dtos/application-variable.dto';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/applicationVariable/dtos/update-application-variable.input';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@MetadataResolver(() => ApplicationVariableEntityDTO)
@UseFilters(ApplicationVariableEntityExceptionFilter)
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
  ) {
    await this.applicationVariableService.update({
      key,
      plainTextValue: value,
      applicationId,
      workspaceId,
    });

    return true;
  }
}
