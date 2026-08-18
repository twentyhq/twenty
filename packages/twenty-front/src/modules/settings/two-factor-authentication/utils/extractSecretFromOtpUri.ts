export const extractSecretFromOtpUri = (otpUri: string): string | null => {
  try {
    const url = new URL(otpUri);
    return url.searchParams.get('secret');
  } catch {
    return null;
  }
};
