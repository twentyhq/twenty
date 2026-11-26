import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const queryFrontComponentPreviewMetadata = async (
  selection: Record<string, unknown>,
) => {
  const { MetadataApiClient } = await import('twenty-client-sdk/metadata');
  const client = new MetadataApiClient({
    url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
    credentials: 'include',
    headers: { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' },
  });

  return client.query(selection);
};
