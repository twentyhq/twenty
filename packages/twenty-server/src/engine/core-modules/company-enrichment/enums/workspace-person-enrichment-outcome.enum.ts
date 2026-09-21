import { registerEnumType } from '@nestjs/graphql';

// Lowercase on purpose: GraphQL serializes member names, which must match the shared WorkspaceEnrichmentResult outcome literals.
export enum WorkspacePersonEnrichmentOutcome {
  matched = 'matched',
  unavailable = 'unavailable',
  transientError = 'transientError',
}

registerEnumType(WorkspacePersonEnrichmentOutcome, {
  name: 'WorkspacePersonEnrichmentOutcome',
});
