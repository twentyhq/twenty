import { BadRequestException } from '@nestjs/common';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const formatMessage = (message: BaseGraphQLError) => {
  let formattedMessage = message.extensions
    ? message.extensions.response.message || message.extensions.response
    : message.message;

  formattedMessage = formattedMessage
    .replace(/"/g, "'")
    .replace("Variable '$data' got i", 'I');

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
