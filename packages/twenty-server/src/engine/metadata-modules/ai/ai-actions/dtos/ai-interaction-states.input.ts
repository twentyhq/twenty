import { Field, InputType } from '@nestjs/graphql';

import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

@InputType()
export class AiInteractionStatesInput {
  @Field(() => [String])
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  actionRequestIds: string[];
}
