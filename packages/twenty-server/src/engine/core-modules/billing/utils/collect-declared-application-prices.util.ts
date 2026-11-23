/* @license Enterprise */

import { type ApplicationBillingPrice } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { toApplicationBillingPricesOrThrow } from 'src/engine/core-modules/application/utils/to-application-billing-prices-or-throw.util';

export type DeclaredApplicationPrice = {
  applicationId: string;
  applicationUniversalIdentifier: string;
  applicationName: string;
  price: ApplicationBillingPrice;
};

export const collectDeclaredApplicationPrices = ({
  applications,
}: {
  applications: Pick<
    FlatApplication,
    | 'id'
    | 'universalIdentifier'
    | 'name'
    | 'version'
    | 'sourceType'
    | 'deletedAt'
    | 'acceptedBillingPrices'
  >[];
}): DeclaredApplicationPrice[] =>
  applications
    .filter(
      (application) =>
        !isDefined(application.deletedAt) &&
        isDefined(application.version) &&
        application.sourceType !== ApplicationRegistrationSourceType.LOCAL,
    )
    .flatMap((application) =>
      toApplicationBillingPricesOrThrow(application.acceptedBillingPrices).map(
        (price) => ({
          applicationId: application.id,
          applicationUniversalIdentifier: application.universalIdentifier,
          applicationName: application.name,
          price,
        }),
      ),
    );
