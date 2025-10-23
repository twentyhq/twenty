import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/applicationVariable/application-variable-exception-filter';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/applicationVariable/dtos/application-variable.dto';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/applicationVariable/dtos/update-application-variable.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => ApplicationVariableEntityDTO)
@UseFilters(ApplicationVariableEntityExceptionFilter)
export class ApplicationVariableEntityResolver {
  constructor(
    private readonly applicationVariableService: ApplicationVariableEntityService,
  ) {}

  @ResolveField(() => String)
  value(@Parent() applicationVariable: ApplicationVariableEntity): string {
    return this.applicationVariableService.maskSecretValue(
      applicationVariable.value,
      applicationVariable.isSecret,
    );
  }

  @Mutation(() => Boolean)
  async updateOneApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableEntityInput,
  ) {
    await this.applicationVariableService.update({ key, value, applicationId });

    return true;
  }
}
