import { Field, ObjectType } from '@nestjs/graphql';

import { CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';

@ObjectType('CoreWorkflowWithVersionsDTO')
export class CoreWorkflowWithVersionsDTO extends CoreWorkflowDTO {
  @Field(() => [CoreWorkflowVersionDTO])
  versions: CoreWorkflowVersionDTO[];

  @Field(() => CoreWorkflowVersionDTO, { nullable: true })
  currentVersion: CoreWorkflowVersionDTO | null;
}
