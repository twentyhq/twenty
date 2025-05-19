import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SearchPageInfoDTO {
  @Field(() => String, { nullable: true })
  endCursor: string | null;

  @Field(() => Boolean)
  hasNextPage: boolean;
}
