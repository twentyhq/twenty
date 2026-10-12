import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

type AdminSortableApplicationRegistration = Pick<
  ApplicationRegistrationEntity,
  'id' | 'isVetted' | 'isListed' | 'createdAt'
>;

// Surfaces what still needs admin action: vetted apps come first, apps missing
// configuration before configured ones, listed apps last, newest first within a group
export const sortApplicationRegistrationsForAdmin = <
  TRegistration extends AdminSortableApplicationRegistration,
>({
  registrations,
  isConfiguredByRegistrationId,
}: {
  registrations: TRegistration[];
  isConfiguredByRegistrationId: Map<string, boolean>;
}): TRegistration[] => {
  return [...registrations].sort((left, right) => {
    if (left.isVetted !== right.isVetted) {
      return left.isVetted ? -1 : 1;
    }

    const isLeftConfigured = isConfiguredByRegistrationId.get(left.id) ?? false;
    const isRightConfigured =
      isConfiguredByRegistrationId.get(right.id) ?? false;

    if (isLeftConfigured !== isRightConfigured) {
      return isLeftConfigured ? 1 : -1;
    }

    if (left.isListed !== right.isListed) {
      return left.isListed ? 1 : -1;
    }

    const createdAtDifference =
      right.createdAt.getTime() - left.createdAt.getTime();

    if (createdAtDifference !== 0) {
      return createdAtDifference;
    }

    return left.id.localeCompare(right.id);
  });
};
