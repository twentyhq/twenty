import { Field, ObjectType } from '@nestjs/graphql';

import { CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';

@ObjectType('CoreWorkflowWithCurrentVersionDTO')
export class CoreWorkflowWithCurrentVersionDTO {
  @Field(() => CoreWorkflowDTO)
  workflow: CoreWorkflowDTO;

  @Field(() => [CoreWorkflowVersionDTO])
  versions: CoreWorkflowVersionDTO[];

  @Field(() => CoreWorkflowVersionDTO)
  currentVersion: CoreWorkflowVersionDTO;
}
