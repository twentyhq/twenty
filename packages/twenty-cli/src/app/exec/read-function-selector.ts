import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AppFunctionSelector } from '@/app/exec/types/app-function-selector.type';
import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const readFunctionSelector = (options: Record<string, unknown>) => {
  const selectors: AppFunctionSelector[] = [];
  const name = readStringOption(options, 'name');
  const universalIdentifier = readStringOption(options, 'universalIdentifier');

  if (isDefined(name)) {
    selectors.push({ kind: 'name', value: name });
  }
  if (isDefined(universalIdentifier)) {
    selectors.push({
      kind: 'universalIdentifier',
      value: universalIdentifier.toLowerCase(),
    });
  }
  if (readBooleanOption(options, 'postInstall')) {
    selectors.push({ kind: 'hook', value: 'postInstallLogicFunction' });
  }
  if (readBooleanOption(options, 'preInstall')) {
    selectors.push({ kind: 'hook', value: 'preInstallLogicFunction' });
  }
  if (readBooleanOption(options, 'uninstallHook')) {
    selectors.push({ kind: 'hook', value: 'uninstallLogicFunction' });
  }

  if (selectors.length !== 1) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message:
        'Choose exactly one of --name, --universal-identifier, --post-install, --pre-install or --uninstall-hook.',
    });
  }

  const selector = selectors[0];
  if (
    selector.value.trim().length === 0 ||
    (selector.kind === 'universalIdentifier' &&
      !isValidUniversalIdentifier(selector.value))
  ) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message:
        selector.kind === 'name'
          ? '--name cannot be empty.'
          : '--universal-identifier must be a UUID of version 4 or later.',
    });
  }

  return selector;
};
