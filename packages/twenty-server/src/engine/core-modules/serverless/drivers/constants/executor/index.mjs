import fs from 'fs';
import { v4 } from 'uuid';

const mainPath = '/tmp/main.mjs';

const clearTmp = () => {
  fs.rmSync('tmp', { recursive: true, force: true });
};

export const handler = async (event) => {
  const { code, params } = event;

  const startTime = Date.now();

  try {
    fs.writeFileSync(mainPath, code, 'utf8');

    const mainFile = await import(mainPath + `?t=${v4()}`);
    const result = await mainFile.main(params);

    clearTmp();

    return {
      duration: Date.now() - startTime,
      data: result,
      status: 'SUCCESS',
    };
  } catch (error) {
    clearTmp();

    const formattedError = {
      errorType: error.name || 'UnhandledError',
      errorMessage: error.message || 'Unknown error',
      stackTrace: error.stack ? error.stack.split('\n') : [],
    };

    return {
      duration: Date.now() - startTime,
      data: null,
      status: 'ERROR',
      error: formattedError,
    };
  }
};
