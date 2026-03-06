import { type OperationTypeNode } from 'graphql';

import { type ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { type ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

export interface ExceptionHandlerOptions {
  operation?: {
    type: OperationTypeNode;
    name: string;
  };
  document?: string;
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  additionalData?: Record<string, any>;
  user?: ExceptionHandlerUser | null;
  workspace?: ExceptionHandlerWorkspace | null;
}
