import { assertUnreachable } from 'twenty-shared/utils';

import { type EmailOperation } from 'src/engine/core-modules/tool/tools/email-tool/types/email-operation.type';

export const getEmailOperationVerb = (operation: EmailOperation): string => {
  switch (operation) {
    case 'SEND':
      return 'send';
    case 'DRAFT':
      return 'draft';
    default:
      return assertUnreachable(
        operation,
        `Unhandled email operation: ${operation}`,
      );
  }
};
