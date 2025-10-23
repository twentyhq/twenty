import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { ApplicationVariableExceptionFilter } from 'src/engine/core-modules/applicationVariable/application-variable-exception-filter';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { ApplicationVariableDTO } from 'src/engine/core-modules/applicationVariable/dtos/application-variable.dto';
import { UpdateApplicationVariableInput } from 'src/engine/core-modules/applicationVariable/dtos/update-application-variable.input';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => ApplicationVariableDTO)
@UseFilters(ApplicationVariableExceptionFilter)
export class ApplicationVariableResolver {
  constructor(
    private readonly applicationVariableService: ApplicationVariableService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  @ResolveField(() => String)
  value(@Parent() applicationVariable: ApplicationVariableEntity): string {
    if (applicationVariable.isSecret) {
      return this.secretEncryptionService.decryptAndMask(
        applicationVariable.value,
      );
    }

    return applicationVariable.value;
  }

  @Mutation(() => Boolean)
  async updateOneApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableInput,
  ) {
    await this.applicationVariableService.update({
      key,
      plainTextValue: value,
      applicationId,
    });

    return true;
  }
}
