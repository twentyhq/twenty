import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { startInventoryServer } from '../startInventoryServer';

const request = (url: string) =>
  new Promise<{ status: number | undefined; body: string }>(
    (resolveRequest, rejectRequest) => {
      get(url, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk: string) => {
          body += chunk;
        });
        response.on('end', () =>
          resolveRequest({ status: response.statusCode, body }),
        );
      }).on('error', rejectRequest);
    },
  );

describe('startInventoryServer', () => {
  let directory: string;
  let server: Awaited<ReturnType<typeof startInventoryServer>>;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'inventory-server-'));
    await writeFile(join(directory, 'iframe.html'), '<title>Story</title>');
    server = await startInventoryServer({
      directory,
      getCatalog: () => ({ schemaVersion: 1 }),
    });
  });

  afterAll(async () => {
    await server.close();
    await rm(directory, { recursive: true, force: true });
  });

  it('serves the blank reference page and the current catalog', async () => {
    expect(await request(`${server.origin}/reference.html`)).toMatchObject({
      status: 200,
      body: expect.stringContaining('<body></body>'),
    });
    expect(
      await request(`${server.origin}/compatibility-catalog.json`),
    ).toEqual({ status: 200, body: '{"schemaVersion":1}' });
  });

  it('serves files from the Storybook build', async () => {
    expect(await request(`${server.origin}/iframe.html?id=story`)).toEqual({
      status: 200,
      body: '<title>Story</title>',
    });
  });

  it('refuses paths that escape the Storybook build', async () => {
    expect(
      await request(`${server.origin}/..%2F..%2Fetc%2Fpasswd`),
    ).toMatchObject({ status: 403 });
  });

  it('answers missing files with a 404', async () => {
    expect(await request(`${server.origin}/missing.js`)).toMatchObject({
      status: 404,
    });
  });
});
