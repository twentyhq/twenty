import { Field, ObjectType } from '@nestjs/graphql';

import { SearchEdgeDTO } from 'src/engine/core-modules/search/dtos/search-edge.dto';
import { SearchPageInfoDTO } from 'src/engine/core-modules/search/dtos/search-page-info.dto';

@ObjectType('Search')
export class SearchDTO {
  @Field(() => [SearchEdgeDTO])
  edges: SearchEdgeDTO[];

  @Field(() => SearchPageInfoDTO)
  pageInfo: SearchPageInfoDTO;
}
