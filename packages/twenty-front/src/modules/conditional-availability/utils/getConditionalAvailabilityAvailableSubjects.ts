import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { getConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityOfferedSubjects';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';

export const getConditionalAvailabilityAvailableSubjects = ({
  metadataName,
  hasRolesPermission,
}: {
  metadataName: ConditionalAvailabilityMetadataName;
  hasRolesPermission: boolean;
}): ConditionalAvailabilitySubject[] => {
  const offeredSubjects = getConditionalAvailabilityOfferedSubjects({
    metadataName,
  });
  const availableSubjects: ConditionalAvailabilitySubject[] = [];

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
