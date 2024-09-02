import { BadRequestException } from '@nestjs/common';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const formatMessage = (message: BaseGraphQLError) => {
  let formattedMessage = message.extensions
    ? message.extensions.response.message || message.extensions.response
    : message.message;

  formattedMessage = formattedMessage
    .replace(/"/g, "'")
    .replace("Variable '$data' got i", 'I');

  const regex =
    /Field '(.*?)' is not defined by type '(.*?)'\. Did you mean '(.*?)'\?/;

  const match = formattedMessage.match(regex);

  if (match) {
    const field = match[1];
    const type = match[2];
    const suggestion = match[3];

    formattedMessage = `Field '${field}' is not defined by type '${type}'. Did you mean '${suggestion}'?`;
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
