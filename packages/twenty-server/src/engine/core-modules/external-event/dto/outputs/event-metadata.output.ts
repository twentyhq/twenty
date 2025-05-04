import { Field, ID, ObjectType } from '@nestjs/graphql';

import { EventFieldMetadataOutput } from './event-field-metadata.output';

@ObjectType()
export class EventMetadataOutput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field()
  strictValidation: boolean;

  @Field(() => [String], { nullable: true })
  validObjectTypes?: string[];

  @Field(() => ID)
  workspaceId: string;

  @Field(() => ID)
  createdById: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [EventFieldMetadataOutput])
  fields: EventFieldMetadataOutput[];
}
