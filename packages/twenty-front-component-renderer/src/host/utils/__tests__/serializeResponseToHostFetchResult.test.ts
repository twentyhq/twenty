import { serializeResponseToHostFetchResult } from '../serializeResponseToHostFetchResult';

describe('serializeResponseToHostFetchResult', () => {
  it('should serialize the status, headers and body of a response', async () => {
    const response = {
      status: 201,
      statusText: 'Created',
      headers: new Headers({
        'content-type': 'application/json',
        'x-schema-version': '42',
      }),
      text: async () => 'response-body',
    } as unknown as Response;

    await expect(serializeResponseToHostFetchResult(response)).resolves.toEqual(
      {
        status: 201,
        statusText: 'Created',
        headers: {
          'content-type': 'application/json',
          'x-schema-version': '42',
        },
        body: 'response-body',
      },
    );
  });
});
