export type WhatsappPersonRecord = {
  id: string;
  phones?: {
    primaryPhoneNumber?: string | null;
    primaryPhoneCallingCode?: string | null;
    additionalPhones?:
      | { number?: string | null; callingCode?: string | null }[]
      | null;
  } | null;
};
