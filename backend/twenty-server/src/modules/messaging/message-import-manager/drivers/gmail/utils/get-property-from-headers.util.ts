import { type gmail_v1 as gmailV1 } from 'googleapis';

export const getPropertyFromHeaders = (
  message: gmailV1.Schema$Message,
  property: string,
) => {
  const header = message.payload?.headers?.find(
    (header) => header.name?.toLowerCase() === property.toLowerCase(),
  );

  return header?.value;
};
