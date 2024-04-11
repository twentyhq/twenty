import console from 'console';

import { DataSource } from 'typeorm';

export const connectionSource = new DataSource({
  type: 'postgres',
  logging: false,
  url: process.env.PG_DATABASE_URL,
});

export const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const performQuery = async (
  query: string,
  consoleDescription: string,
  withLog = true,
  ignoreAlreadyExistsError = false,
) => {
  try {
    const result = await connectionSource.query(query);

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
