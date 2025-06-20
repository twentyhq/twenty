import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteWebhookDTO {
  @Field()
  id: string;
}
