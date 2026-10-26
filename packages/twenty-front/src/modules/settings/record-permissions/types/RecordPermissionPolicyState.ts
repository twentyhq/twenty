import {
  type RecordCapabilities,
  type RecordPermissionPolicyDefinition,
  type RecordPermissionRevisionStatus,
} from 'twenty-shared/types';

export type RecordPermissionPolicyState = {
  activeRevisionId: string | null;
  activeDefinition: RecordPermissionPolicyDefinition | null;
  candidateRevisionId: string | null;
  status: RecordPermissionRevisionStatus | 'inactive';
  definition: RecordPermissionPolicyDefinition;
  capabilitiesByObjectUniversalIdentifier: Record<string, RecordCapabilities>;
  progress: {
    revisionId: string;
    processed: string;
    completedObjects: number;
    totalObjects: number;
  }[];
  failureReason: string | null;
};
