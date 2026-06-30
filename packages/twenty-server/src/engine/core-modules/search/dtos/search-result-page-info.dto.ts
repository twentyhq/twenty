import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SearchResultPageInfo')
export class SearchResultPageInfoDTO {
  @Field(() => String, { nullable: true })
  endCursor: string | null;

  @Field(() => Boolean)
  hasNextPage: boolean;
}
