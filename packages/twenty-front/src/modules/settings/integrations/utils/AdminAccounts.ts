const ALLOWED_ADMIN_DOMAIN = 'insuros.ca';

export const isInsurOSAdminAccount = (email: string) => {
  const [localPart, domain] = email.split('@');
  return (
    domain === ALLOWED_ADMIN_DOMAIN && !localPart.toLowerCase().includes('demo')
  );
};
