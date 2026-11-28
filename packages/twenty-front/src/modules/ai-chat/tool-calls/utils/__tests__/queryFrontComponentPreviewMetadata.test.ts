import {
  createQueryFrontComponentPreviewMetadata,
  fetchFrontComponentPreviewMetadataQuery,
} from '@/ai-chat/tool-calls/utils/queryFrontComponentPreviewMetadata';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

it('queries live field options using the application token without session cookies', async () => {
  const queryMetadata = createQueryFrontComponentPreviewMetadata(
    async () => 'test-app-token',
  );
  const data = {
    object: {
      fields: {
        edges: [
          {
            node: {
              name: 'stage',
              options: [
                {
                  label: 'Discovery',
                  value: 'NEW',
                  color: 'green',
                  position: 2,
                },
              ],
            },
          },
        ],
      },
    },
  };
  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ data }),
  });
  globalThis.fetch = fetchMock;

  try {
    await expect(
      queryMetadata({
        object: {
          __args: { id: 'opportunity' },
          fields: {
            __args: { filter: {}, paging: { first: 10 } },
            edges: { node: { name: true, options: true } },
          },
        },
      }),
    ).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      `${REACT_APP_SERVER_BASE_URL}/metadata`,
      expect.objectContaining({
        credentials: 'omit',
        redirect: 'error',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-app-token',
        },
        body: expect.stringContaining('options'),
      }),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

it.each([
  'mutation Change { __typename }',
  'subscription Listen { __typename }',
  'query One { __typename } query Two { __typename }',
])(
  'rejects an unsupported document before requesting an application token',
  async (query) => {
    const getApplicationAccessToken = jest.fn();

    await expect(
      fetchFrontComponentPreviewMetadataQuery({
        body: JSON.stringify({ query }),
        getApplicationAccessToken,
      }),
    ).rejects.toThrow('Only Metadata API queries are available');
    expect(getApplicationAccessToken).not.toHaveBeenCalled();
  },
);
