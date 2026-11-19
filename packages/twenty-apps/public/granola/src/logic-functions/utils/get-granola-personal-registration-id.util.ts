import { GRANOLA_PERSONAL_REGISTRATION_PREFIX } from 'src/constants/granola-personal-connection.constant';

export const getGranolaPersonalRegistrationId = (connectionId: string) =>
  GRANOLA_PERSONAL_REGISTRATION_PREFIX + connectionId;
