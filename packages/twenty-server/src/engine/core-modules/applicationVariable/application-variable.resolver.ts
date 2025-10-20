import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationVariableService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { UpdateApplicationVariableInput } from 'src/engine/core-modules/applicationVariable/dtos/update-application-variable.input';
import { ApplicationVariableExceptionFilter } from 'src/engine/core-modules/applicationVariable/application-variable-exception-filter';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UseFilters(ApplicationVariableExceptionFilter)
export class ApplicationVariableResolver {
  constructor(
    private readonly applicationVariableService: ApplicationVariableService,
  ) {}

  @Mutation(() => Boolean)
  async updateOneApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableInput,
  ) {
    await this.applicationVariableService.update({ key, value, applicationId });

    return true;
  }
}
