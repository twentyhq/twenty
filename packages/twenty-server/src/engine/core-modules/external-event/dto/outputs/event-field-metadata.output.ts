import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventFieldMetadataOutput {
  @Field(() => ID)
  id: string;

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

  @Field(() => ID)
  eventMetadataId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
