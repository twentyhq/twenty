import console from 'console';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const performQuery = async <T = unknown>(
  query: string,
  consoleDescription: string,
  withLog = true,
  ignoreAlreadyExistsError = false,
) => {
  try {
    const result = await rawDataSource.query<T>(query);

    withLog && console.log(`Performed '${consoleDescription}' successfully`);

    return result;
  } catch (err) {
    let message = '';

    if (ignoreAlreadyExistsError && `${err}`.includes('already exists')) {
      message = `Performed '${consoleDescription}' successfully`;
    } else {
      message = `Failed to perform '${consoleDescription}': ${err}`;
    }
    withLog && console.error(message);
  }
};
