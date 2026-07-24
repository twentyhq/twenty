import { registerEnumType } from '@nestjs/graphql';

// Members are lowercase on purpose: the GraphQL enum serializes member names,
// and these must match the WorkspaceCompanyEnrichmentResult outcome literals
// shared with the frontend.
export enum WorkspaceCompanyEnrichmentOutcome {
  matched = 'matched',
  unavailable = 'unavailable',
  transientError = 'transientError',
}

registerEnumType(WorkspaceCompanyEnrichmentOutcome, {
  name: 'WorkspaceCompanyEnrichmentOutcome',
});
