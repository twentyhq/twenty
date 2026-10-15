import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { isTwentyApplicationPackage } from 'src/engine/core-modules/application/application-registration/utils/is-twenty-application-package.util';

type AdminSortableApplicationRegistration = Pick<
  ApplicationRegistrationEntity,
  | 'id'
  | 'universalIdentifier'
  | 'name'
  | 'sourcePackage'
  | 'isVetted'
  | 'isListed'
>;

export const sortApplicationRegistrationsForAdmin = <
  TRegistration extends AdminSortableApplicationRegistration,
>({
  registrations,
  isConfiguredByRegistrationId,
  installCountByRegistrationId,
}: {
  registrations: TRegistration[];
  isConfiguredByRegistrationId: Map<string, boolean>;
  installCountByRegistrationId: Map<string, number>;
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

    const isLeftFromTwenty = isTwentyApplicationPackage(left.sourcePackage);
    const isRightFromTwenty = isTwentyApplicationPackage(right.sourcePackage);

    if (isLeftFromTwenty !== isRightFromTwenty) {
      return isLeftFromTwenty ? -1 : 1;
    }

    const installCountDifference =
      (installCountByRegistrationId.get(right.id) ?? 0) -
      (installCountByRegistrationId.get(left.id) ?? 0);

    if (installCountDifference !== 0) {
      return installCountDifference;
    }

    const nameComparison = left.name.localeCompare(right.name, undefined, {
      sensitivity: 'base',
    });

    if (nameComparison !== 0) {
      return nameComparison;
    }

    return left.universalIdentifier.localeCompare(right.universalIdentifier);
  });
};
