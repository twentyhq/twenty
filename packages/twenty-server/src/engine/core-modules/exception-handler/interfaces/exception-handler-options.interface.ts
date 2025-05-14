import { OperationTypeNode } from 'graphql';

import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

export interface ExceptionHandlerOptions {
  operation?: {
    type: OperationTypeNode;
    name: string;
  };
  document?: string;
  additionalData?: Record<string, any>;
  user?: ExceptionHandlerUser | null;
  workspace?: ExceptionHandlerWorkspace | null;
}
