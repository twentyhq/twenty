import { BadRequestException } from '@nestjs/common';

import { BaseGraphQLError } from 'src/engine/utils/graphql-errors.util';

const formatMessage = (message: BaseGraphQLError) => {
  if (message.extensions) {
    return message.extensions.response.message || message.extensions.response;
  }

  return message.message;
};

export class RestApiException extends BadRequestException {
  constructor(errors: BaseGraphQLError[]) {
    super({
      statusCode: 400,
      message:
        errors.length === 1
          ? formatMessage(errors[0])
          : JSON.stringify(errors.map((error) => formatMessage(error))),
      error: 'Bad Request',
    });
  }
}
