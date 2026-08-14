import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';

// RESEND and LOG ship under the community license; AWS_SES and MAILGUN are
// Enterprise-licensed and require a valid plan on self-hosted instances.
export const isCommunityEmailingDomainDriver = (
  driver: EmailingDomainDriver,
): boolean => {
  return (
    driver === EmailingDomainDriver.RESEND ||
    driver === EmailingDomainDriver.LOG
  );
};
