import { type UnipileAuthCheckpoint } from 'src/unipile/types/unipile-auth-checkpoint.type';

const INSTRUCTION_BY_CODE_SOURCE: Partial<Record<string, string>> = {
  EMAIL: 'LinkedIn emailed you a verification code.',
  SMS: 'LinkedIn texted you a verification code.',
  WHATSAPP: 'LinkedIn sent you a verification code on WhatsApp.',
  APP: 'Enter the code from your authenticator app.',
};

export const getLinkedinConnectCodeInstruction = ({
  type,
  channel,
  platform,
}: Pick<UnipileAuthCheckpoint, 'type' | 'channel' | 'platform'>): string => {
  const instruction =
    INSTRUCTION_BY_CODE_SOURCE[channel ?? platform ?? ''] ??
    'LinkedIn sent you a verification code.';

  return type === 'OTP_OR_IN_APP_VALIDATION'
    ? `${instruction} You can also approve the sign-in in the LinkedIn app.`
    : instruction;
};
