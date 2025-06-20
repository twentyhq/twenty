import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateWebhookDTO {
  @Field()
  id: string;

  @Field({ nullable: true })
  targetUrl?: string;

  @Field(() => [String], { nullable: true })
  operations?: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  secret?: string;
}
