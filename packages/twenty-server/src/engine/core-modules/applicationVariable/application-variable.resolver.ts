import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/applicationVariable/application-variable-exception-filter';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/applicationVariable/dtos/update-application-variable.input';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@Resolver()
@UseFilters(ApplicationVariableEntityExceptionFilter)
export class ApplicationVariableEntityResolver {
  constructor(
    private readonly applicationVariableService: ApplicationVariableEntityService,
  ) {}

  @Mutation(() => Boolean)
  async updateOneApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableEntityInput,
  ) {
    await this.applicationVariableService.update({ key, value, applicationId });

    return true;
  }
}
