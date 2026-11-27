import {
  appendFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFile,
  renameSync,
  rmSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

// Serves Nx's self-hosted remote cache API (GET/PUT /v1/cache/{hash}) from a directory.
// Nx fails the command on a 5xx or connection error, so failures answer 404 (miss) or 403 (read-only).

const directory = process.env.NX_CACHE_SERVER_DIRECTORY;
const usageLog = join(directory, '.usage');
const CACHE_PATH_PATTERN = /^\/v1\/cache\/([A-Za-z0-9_-]+)$/;

mkdirSync(directory, { recursive: true });

const recordUsage = ({ usage, hash }) => {
  try {
    appendFileSync(usageLog, `${usage} ${hash}\n`);
  } catch (error) {
    console.error(`Could not record Nx cache ${usage} for ${hash}`, error);
  }
};

const end = ({ response, status }) => {
  if (!response.headersSent) {
    response.writeHead(status);
  }
  response.end();
};

// Read fully before answering so a read failure is a clean 404, never a truncated 200.
const handleGet = ({ hash, response }) => {
  readFile(join(directory, hash), (error, content) => {
    if (error) {
      recordUsage({ usage: 'miss', hash });
      end({ response, status: 404 });
      return;
    }

    recordUsage({ usage: 'hit', hash });
    response.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': content.length,
    });
    response.end(content);
  });
};

const handlePut = ({ hash, request, response }) => {
  const file = join(directory, hash);

  if (existsSync(file)) {
    request.resume();
    end({ response, status: 409 });
    return;
  }

  const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  const output = createWriteStream(temporaryFile);

  const reject = () => {
    request.resume();
    rmSync(temporaryFile, { force: true });
    end({ response, status: 403 });
  };

  output.on('error', reject);
  request.on('error', reject);
  output.on('finish', () => {
    try {
      renameSync(temporaryFile, file);
      recordUsage({ usage: 'write', hash });
      end({ response, status: 200 });
    } catch {
      reject();
    }
  });
  request.pipe(output);
};

const server = createServer((request, response) => {
  try {
    const match = CACHE_PATH_PATTERN.exec(request.url ?? '');

    if (match && request.method === 'GET') {
      handleGet({ hash: match[1], response });
      return;
    }

    if (match && request.method === 'PUT') {
      handlePut({ hash: match[1], request, response });
      return;
    }

    request.resume();
    end({ response, status: 404 });
  } catch {
    end({ response, status: request.method === 'PUT' ? 403 : 404 });
  }
});

process.on('uncaughtException', (error) => {
  console.error('Nx cache server error', error);
});

server.listen(0, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${server.address().port}`);
});
