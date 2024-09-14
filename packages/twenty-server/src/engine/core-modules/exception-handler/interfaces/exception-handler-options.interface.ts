import { OperationTypeNode } from 'graphql';

import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';

export interface ExceptionHandlerOptions {
  operation?: {
    type: OperationTypeNode;
    name: string;
  };
  document?: string;
  user?: ExceptionHandlerUser | null;
}
