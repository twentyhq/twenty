/**
 * Extracts the secret from an OTP URI (otpauth://totp/...)
 * @param otpUri - The OTP URI containing the secret
 * @returns The secret string or null if not found
 */
export const extractSecretFromOtpUri = (otpUri: string): string | null => {
  try {
    const url = new URL(otpUri);
    return url.searchParams.get('secret');
  } catch {
    return null;
  }
};
