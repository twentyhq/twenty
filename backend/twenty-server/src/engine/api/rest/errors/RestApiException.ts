import { BadRequestException } from '@nestjs/common';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const formatMessage = (error: BaseGraphQLError) => {
  let formattedMessage = error.extensions
    ? error.extensions.response?.error ||
      error.extensions.response ||
      error.message
    : error.error || error.message;

  formattedMessage = formattedMessage
    .replace(/"/g, "'")
    .replace("Variable '$data' got i", 'I')
    .replace("Variable '$input' got i", 'I');

  const regex = /Field '[^']+' is not defined by type .*/;

  const match = formattedMessage.match(regex);

  if (match) {
    formattedMessage = match[0];
  }

  return formattedMessage;
};

export class RestApiException extends BadRequestException {
  constructor(errors: BaseGraphQLError[]) {
    super({
      statusCode: 400,
      messages: errors.map((error) => formatMessage(error)),
      error: 'Bad Request',
    });
  }
}
