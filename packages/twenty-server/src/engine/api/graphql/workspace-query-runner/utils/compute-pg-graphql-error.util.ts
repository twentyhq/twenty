import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

interface PgGraphQLErrorMapping {
  [key: string]: (command: string, objectName: string) => HttpException;
}

const pgGraphQLCommandMapping = {
  insertInto: 'insert',
  update: 'update',
  deleteFrom: 'delete',
};

const pgGraphQLErrorMapping: PgGraphQLErrorMapping = {
  'delete impacts too many records': (command, objectName) =>
    new BadRequestException(
      `Cannot ${
        pgGraphQLCommandMapping[command] ?? command
      } ${objectName} because it impacts too many records.`,
    ),
  'duplicate key value violates unique constraint': (command, objectName) =>
    new BadRequestException(
      `Cannot ${
        pgGraphQLCommandMapping[command] ?? command
      } ${objectName} because it violates a uniqueness constraint.`,
    ),
};

export const computePgGraphQLError = (
  command: string,
  objectName: string,
  errors: any[],
) => {
  const error = errors[0];
  const errorMessage = error?.message;

  const mappedErrorKey = Object.keys(pgGraphQLErrorMapping).find(
    (key) => errorMessage?.startsWith(key),
  );

  const mappedError = mappedErrorKey
    ? pgGraphQLErrorMapping[mappedErrorKey]
    : null;

  if (mappedError) {
    return mappedError(command, objectName);
  }

  return new InternalServerErrorException(
    `GraphQL errors on ${command}${objectName}: ${JSON.stringify(error)}`,
  );
};
