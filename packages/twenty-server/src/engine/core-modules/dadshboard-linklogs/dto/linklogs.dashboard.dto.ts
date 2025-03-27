import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LinklogsDto {
  @Field(() => String)
  id: string;
}
