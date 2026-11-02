import { Field, ObjectType } from '@nestjs/graphql';

import { GettingStartedWorkflowPreviewActionDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow-preview-action.dto';
import { GettingStartedWorkflowPreviewTriggerDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow-preview-trigger.dto';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

@ObjectType('GettingStartedWorkflowPreview')
export class GettingStartedWorkflowPreviewDTO {
  @Field(() => GettingStartedStepActionKey)
  stepActionKey: GettingStartedStepActionKey;

  @Field(() => GettingStartedWorkflowPreviewTriggerDTO)
  trigger: GettingStartedWorkflowPreviewTriggerDTO;

  @Field(() => [GettingStartedWorkflowPreviewActionDTO])
  actions: GettingStartedWorkflowPreviewActionDTO[];
}
