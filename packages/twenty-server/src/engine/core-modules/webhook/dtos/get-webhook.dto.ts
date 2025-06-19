import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetWebhookDTO {
  @Field()
  id: string;
}
