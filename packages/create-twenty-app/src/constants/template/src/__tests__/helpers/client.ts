import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const metadata = () =>
  new MetadataApiClient({
    headers: {
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
  });
