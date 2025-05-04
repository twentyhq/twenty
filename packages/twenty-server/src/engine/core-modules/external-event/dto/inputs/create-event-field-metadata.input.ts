import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateEventFieldMetadataInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  fieldType: string;

  @Field()
  isRequired: boolean;

  @Field(() => [String], { nullable: true })
  allowedValues?: string[];
}
