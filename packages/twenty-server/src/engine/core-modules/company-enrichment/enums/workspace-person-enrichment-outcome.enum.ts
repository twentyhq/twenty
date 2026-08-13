import { registerEnumType } from '@nestjs/graphql';

// Members are lowercase on purpose: the GraphQL enum serializes member names,
// and these must match the WorkspacePersonEnrichmentResult outcome literals
// shared with the frontend.
export enum WorkspacePersonEnrichmentOutcome {
  matched = 'matched',
  unavailable = 'unavailable',
  transientError = 'transientError',
}

registerEnumType(WorkspacePersonEnrichmentOutcome, {
  name: 'WorkspacePersonEnrichmentOutcome',
});
