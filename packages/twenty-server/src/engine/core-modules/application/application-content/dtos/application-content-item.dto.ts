import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationContentItem')
export class ApplicationContentItemDTO {
  @Field()
  universalIdentifier: string;

  @Field()
  label: string;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  objectUniversalIdentifier?: string | null;

  @Field(() => String, { nullable: true })
  parentLabel?: string | null;

  @Field(() => String, { nullable: true })
  tag?: string | null;

  @Field(() => Int, { nullable: true })
  count?: number | null;
}
