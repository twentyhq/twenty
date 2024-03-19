import { OperationTypeNode } from 'graphql';

import { ExceptionHandlerUser } from './exception-handler-user.interface';

export interface ExceptionHandlerOptions {
  operation?: {
    type: OperationTypeNode;
    name: string;
  };
  document?: string;
  user?: ExceptionHandlerUser;
}
