import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';

const FALLBACK_MEMBER_ROLE_LABEL = 'Workspace Member';

export const getAvailableMemberRoleLabel = (takenLabels: string[]): string => {
  if (!takenLabels.includes(MEMBER_ROLE_LABEL)) {
    return MEMBER_ROLE_LABEL;
  }

  let label = FALLBACK_MEMBER_ROLE_LABEL;

  for (let suffix = 2; takenLabels.includes(label); suffix++) {
    label = `${FALLBACK_MEMBER_ROLE_LABEL} ${suffix}`;
  }

  return label;
};
