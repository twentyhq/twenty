import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

export type PgGraphQLConfig = {
  atMost: number;
};

interface PgGraphQLErrorMapping {
  [key: string]: (
    command: string,
    objectName: string,
    pgGraphqlConfig: PgGraphQLConfig,
  ) => HttpException;
}

const pgGraphQLCommandMapping = {
  insertInto: 'insert',
  update: 'update',
  deleteFrom: 'delete',
};

const pgGraphQLErrorMapping: PgGraphQLErrorMapping = {
  'delete impacts too many records': (_, objectName, pgGraphqlConfig) =>
    new BadRequestException(
      `Cannot delete ${objectName} because it impacts too many records (more than ${pgGraphqlConfig?.atMost}).`,
    ),
  'update impacts too many records': (_, objectName, pgGraphqlConfig) =>
    new BadRequestException(
      `Cannot update ${objectName} because it impacts too many records (more than ${pgGraphqlConfig?.atMost}).`,
    ),
  'duplicate key value violates unique constraint': (command, objectName, _) =>
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
  pgGraphqlConfig: PgGraphQLConfig,
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
    return mappedError(command, objectName, pgGraphqlConfig);
  }

  return new InternalServerErrorException(
    `GraphQL errors on ${command}${objectName}: ${JSON.stringify(error)}`,
  );
};
