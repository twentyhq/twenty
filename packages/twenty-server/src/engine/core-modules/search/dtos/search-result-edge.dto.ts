import { Field, ObjectType } from '@nestjs/graphql';

import { SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record.dto';

@ObjectType('SearchResultEdge')
export class SearchResultEdgeDTO {
  @Field(() => SearchRecordDTO)
  node: SearchRecordDTO;

  @Field(() => String)
  cursor: string;
}
