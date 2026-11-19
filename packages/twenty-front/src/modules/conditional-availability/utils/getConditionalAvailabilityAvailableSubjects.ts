import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
import { getConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityOfferedSubjects';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';

export const getConditionalAvailabilityAvailableSubjects = ({
  metadataName,
  hasRolesPermission,
}: {
  metadataName: ConditionalAvailabilityMetadataName;
  hasRolesPermission: boolean;
}): ConditionalAvailabilityPathSubject[] => {
  const offeredSubjects = getConditionalAvailabilityOfferedSubjects({
    metadataName,
  });
  const availableSubjects: ConditionalAvailabilityPathSubject[] = [];

  if (offeredSubjects.role && hasRolesPermission) {
    availableSubjects.push('role');
  }

  if (offeredSubjects.workspaceMember) {
    availableSubjects.push('workspaceMember');
  }

  if (offeredSubjects.device) {
    availableSubjects.push('device');
  }

  return availableSubjects;
};
