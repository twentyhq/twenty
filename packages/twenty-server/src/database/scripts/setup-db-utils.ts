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

    if (withLog) {
      // oxlint-disable-next-line no-console
      console.log(`Performed '${consoleDescription}' successfully`);
    }

    return result;
  } catch (err) {
    if (ignoreAlreadyExistsError && `${err}`.includes('already exists')) {
      if (withLog) {
        // oxlint-disable-next-line no-console
        console.log(`Performed '${consoleDescription}' successfully`);
      }

      return;
    }

    if (withLog) {
      // oxlint-disable-next-line no-console
      console.error(`Failed to perform '${consoleDescription}': ${err}`);
    }

    // A swallowed failure here leaves a half-built DB that passes silently and
    // crashes a random downstream test (e.g. "core.keyValuePair does not exist").
    throw err;
  }
};
