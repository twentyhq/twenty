import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

import { queryFrontComponentPreviewMetadata } from '@/ai-chat/tool-calls/utils/queryFrontComponentPreviewMetadata';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

it('queries live field options using the current user session', async () => {
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
      queryFrontComponentPreviewMetadata({
        object: {
          __args: { id: 'opportunity' },
          fields: { edges: { node: { name: true, options: true } } },
        },
      }),
    ).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      `${REACT_APP_SERVER_BASE_URL}/metadata`,
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
        body: expect.stringContaining('options'),
      }),
    );
    expect(
      fetchMock.mock.calls[0][1].headers.get(SESSION_COOKIE_OPT_IN_HEADER_NAME),
    ).toBe('1');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
