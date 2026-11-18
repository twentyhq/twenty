import { EmailDriver } from 'src/engine/core-modules/email/enums/email-driver.enum';

export const isEmailDeliveryConfigured = (emailDriver: EmailDriver): boolean =>
  emailDriver !== EmailDriver.LOGGER;
