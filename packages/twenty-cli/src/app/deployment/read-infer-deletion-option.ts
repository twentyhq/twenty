import { isBoolean } from '@sniptt/guards';

import { type CommandContext } from '@/catalog/types/command-context.type';

// Undefined leaves the default to the server, which depends on the application.
export const readInferDeletionOption = ({
  options,
  output,
}: Pick<CommandContext, 'options' | 'output'>): boolean | undefined => {
  const isDeprecatedNoDeletePassed = options.delete === false;

  if (isDeprecatedNoDeletePassed) {
    output.warn({
      code: 'DEPRECATED_OPTION',
      message: '--no-delete is deprecated, use --no-prune instead.',
    });
  }

  if (isBoolean(options.prune)) {
    return options.prune;
  }

  return isDeprecatedNoDeletePassed ? false : undefined;
};
