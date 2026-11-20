import { EmailDriver } from 'src/engine/core-modules/email/enums/email-driver.enum';

export const isInvitationLinkSharingEnabled = ({
  emailDriver,
  isEmailVerificationRequired,
}: {
  emailDriver: EmailDriver;
  isEmailVerificationRequired: boolean;
}): boolean =>
  emailDriver === EmailDriver.LOGGER && !isEmailVerificationRequired;
