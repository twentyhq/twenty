import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

@ObjectType('WorkspaceCompanyEnrichmentResult')
export class WorkspaceCompanyEnrichmentResultDTO {
  @Field(() => String)
  outcome: 'matched' | 'unavailable' | 'transientError';

  @Field(() => GraphQLJSON, { nullable: true })
  enrichment: WorkspaceCompanyEnrichment | null;
}
