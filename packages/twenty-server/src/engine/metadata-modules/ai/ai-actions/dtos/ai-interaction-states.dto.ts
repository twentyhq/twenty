import { Field, ObjectType } from '@nestjs/graphql';

import { AiActionStateDTO } from 'src/engine/metadata-modules/ai/ai-actions/dtos/ai-action-state.dto';

@ObjectType('AiInteractionStates')
export class AiInteractionStatesDTO {
  @Field(() => [AiActionStateDTO])
  actions: AiActionStateDTO[];
}
