export const isEmailFromTrustedProvider = (email: string) => {
  return email.endsWith('@gmail.com') || email.endsWith('@outlook.com');
};
