import { Field, ObjectType } from '@nestjs/graphql';

import { SearchResultEdgeDTO } from 'src/engine/core-modules/search/dtos/search-result-edge.dto';
import { SearchResultPageInfoDTO } from 'src/engine/core-modules/search/dtos/search-result-page-info.dto';

@ObjectType('SearchResultConnection')
export class SearchResultConnectionDTO {
  @Field(() => [SearchResultEdgeDTO])
  edges: SearchResultEdgeDTO[];

  @Field(() => SearchResultPageInfoDTO)
  pageInfo: SearchResultPageInfoDTO;
}
