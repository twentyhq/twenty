import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationContentItem')
export class ApplicationContentItemDTO {
  @Field()
  universalIdentifier: string;

  @Field(() => String, { nullable: true })
  id?: string | null;

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
  parentUniversalIdentifier?: string | null;

  @Field(() => String, { nullable: true })
  fieldUniversalIdentifier?: string | null;

  @Field(() => String, { nullable: true })
  tag?: string | null;

  @Field(() => Int, { nullable: true })
  count?: number | null;

  @Field(() => Float, { nullable: true })
  position?: number | null;

  @Field(() => Int, { nullable: true })
  timeoutSeconds?: number | null;
}
