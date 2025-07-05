import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class GetWebhookDTO {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;
}
