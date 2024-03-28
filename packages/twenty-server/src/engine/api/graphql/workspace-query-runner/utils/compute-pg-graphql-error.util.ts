import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

interface PgGraphQLErrorMapping {
  [key: string]: (command: string, objectName: string) => HttpException;
}

const pgGraphQLErrorMapping: PgGraphQLErrorMapping = {
  'delete impacts too many records': (command, objectName) =>
    new BadRequestException(
      `Cannot ${command} ${objectName} because it impacts too many records.`,
    ),
};

export const computePgGraphQLError = (
  command: string,
  objectName: string,
  errors: any[],
) => {
  const error = errors[0];
  const errorMessage = error?.message;
  const mappedError = pgGraphQLErrorMapping[errorMessage];

  if (mappedError) {
    return mappedError(command, objectName);
  }

  return new InternalServerErrorException(
    `GraphQL errors on ${command}${objectName}: ${JSON.stringify(error)}`,
  );
};
