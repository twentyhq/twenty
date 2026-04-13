import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const metadata = () =>
  new MetadataApiClient({
    headers: {
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
  });

export const core = () => new CoreApiClient();
