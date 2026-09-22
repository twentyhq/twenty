import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

export const startInventoryServer = async ({
  directory,
  getCatalog,
}: {
  directory: string;
  getCatalog: () => unknown;
}) => {
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
      response.setHeader('Cache-Control', 'no-store');
      if (pathname === '/reference.html') {
        response.setHeader('Content-Type', 'text/html');
        response.end(
          '<!doctype html><html><head><meta charset="utf-8"><title>Inventory reference</title></head><body></body></html>',
        );
        return;
      }
      if (pathname === '/compatibility-catalog.json') {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(getCatalog()));
        return;
      }
      const file = resolve(directory, `.${decodeURIComponent(pathname)}`);
      if (!file.startsWith(`${resolve(directory)}${sep}`)) {
        response.writeHead(403).end();
        return;
      }
      response.setHeader(
        'Content-Type',
        contentTypes[extname(file)] ?? 'application/octet-stream',
      );
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise<void>((resolveListening, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListening);
  });
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Missing inventory server address');
  }
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolveClosed, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolveClosed()));
      }),
  };
};
