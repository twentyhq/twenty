import { type ApplicationHealthCheckState } from '@/settings/applications/types/ApplicationHealthCheckState';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { type TypedDocumentNode } from '@apollo/client';
import { type ApplicationHealthCheckResultFieldsFragment } from '~/generated-metadata/graphql';

export type ApplicationHealthCheckRunner<TData> = {
  healthCheckFamilyState: FamilyState<ApplicationHealthCheckState, string>;
  healthCheckMutation: TypedDocumentNode<TData, { applicationId: string }>;
  getHealthCheckResult: (
    data: TData,
  ) => ApplicationHealthCheckResultFieldsFragment | null;
};
