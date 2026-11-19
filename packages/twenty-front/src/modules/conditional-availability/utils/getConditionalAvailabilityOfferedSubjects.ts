import { type ConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/types/ConditionalAvailabilityOfferedSubjects';
import { CONDITIONAL_AVAILABILITY_VARIABLES } from 'twenty-shared/constants';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';

export const getConditionalAvailabilityOfferedSubjects = ({
  metadataName,
}: {
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityOfferedSubjects => {
  const variables = CONDITIONAL_AVAILABILITY_VARIABLES[metadataName];

  return {
    role: 'currentRole' in variables,
    workspaceMember: 'currentWorkspaceMember' in variables,
    device: 'device' in variables,
  };
};
