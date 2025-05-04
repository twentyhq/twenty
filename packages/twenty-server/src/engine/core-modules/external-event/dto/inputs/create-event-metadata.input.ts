import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateEventMetadataInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  validObjectTypes?: string[];

  @Field({ defaultValue: false })
  strictValidation: boolean;
}
