import { GraphqlQueryRunnerExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class GraphqlQueryRunnerException extends CustomException {
  constructor(message: string, code: GraphqlQueryRunnerExceptionCode) {
    super(message, code);
  }
}
