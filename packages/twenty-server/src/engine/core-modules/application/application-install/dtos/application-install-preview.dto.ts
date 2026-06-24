import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';

import { ApplicationPermissionPlanDTO } from 'src/engine/core-modules/application/application-install/dtos/application-permission-plan.dto';
import { ApplicationSetupPlanDTO } from 'src/engine/core-modules/application/application-install/dtos/application-setup-plan.dto';

@ObjectType('ApplicationInstallPreview')
export class ApplicationInstallPreviewDTO {
  @Field(() => GraphQLJSON)
  manifest: Manifest;

  @Field(() => ApplicationSetupPlanDTO)
  setupPlan: ApplicationSetupPlanDTO;

  @Field(() => ApplicationPermissionPlanDTO)
  permissionPlan: ApplicationPermissionPlanDTO;
}
