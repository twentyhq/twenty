const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string') {
      return message;
    }
  }

  return '';
};

const getErrorCode = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const extensions = (error as { extensions?: { code?: unknown } })
      .extensions;

    if (
      typeof extensions === 'object' &&
      extensions !== null &&
      typeof extensions.code === 'string'
    ) {
      return extensions.code;
    }
  }

  return '';
};

// Maps a known sync failure to a one-line next action the developer can take,
// so the CLI points to a recovery step instead of leaving them to guess.
export const getSyncErrorRecoveryHint = (
  error: unknown,
): string | undefined => {
  const message = getErrorMessage(error).toLowerCase();
  const code = getErrorCode(error);

  if (code === 'APP_NOT_INSTALLED' || message.includes('not installed')) {
    return 'Hint: run `yarn twenty dev --once` to register the app in this workspace, then retry.';
  }

  if (
    message.includes('already exists') ||
    message.includes('universalidentifier') ||
    /migration action .* failed/.test(message)
  ) {
    return 'Hint: a metadata conflict was detected. Preview the plan with `yarn twenty dev --once --dry-run`; if it persists, run `yarn twenty app:uninstall -y` then sync again.';
  }

  return undefined;
};
