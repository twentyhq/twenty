import { Field, ObjectType } from '@nestjs/graphql';

import { SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record.dto';

@ObjectType('SearchEdge')
export class SearchEdgeDTO {
  @Field(() => SearchRecordDTO)
  node: SearchRecordDTO;

  @Field(() => String, { nullable: true })
  cursor?: string | null;
}
