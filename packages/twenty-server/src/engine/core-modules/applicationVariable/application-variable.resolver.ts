import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/applicationVariable/dtos/update-application-variable.input';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/applicationVariable/application-variable-exception-filter';

@UseGuards(WorkspaceAuthGuard)
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
