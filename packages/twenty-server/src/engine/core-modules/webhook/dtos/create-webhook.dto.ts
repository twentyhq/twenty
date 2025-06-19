import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWebhookDTO {
  @Field()
  targetUrl: string;

  @Field(() => [String])
  operations: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  secret?: string;
}
