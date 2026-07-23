import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { WorkspaceCompanyEnrichmentOutcome } from 'src/engine/core-modules/company-enrichment/enums/workspace-company-enrichment-outcome.enum';

@ObjectType('WorkspaceCompanyEnrichmentResult')
export class WorkspaceCompanyEnrichmentResultDTO {
  @Field(() => WorkspaceCompanyEnrichmentOutcome)
  outcome: WorkspaceCompanyEnrichmentOutcome;

  @Field(() => GraphQLJSON, { nullable: true })
  enrichment: WorkspaceCompanyEnrichment | null;
}
