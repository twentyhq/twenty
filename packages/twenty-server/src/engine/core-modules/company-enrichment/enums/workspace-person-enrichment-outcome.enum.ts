import { registerEnumType } from '@nestjs/graphql';

export enum WorkspacePersonEnrichmentOutcome {
  matched = 'matched',
  unavailable = 'unavailable',
  transientError = 'transientError',
}

registerEnumType(WorkspacePersonEnrichmentOutcome, {
  name: 'WorkspacePersonEnrichmentOutcome',
});
