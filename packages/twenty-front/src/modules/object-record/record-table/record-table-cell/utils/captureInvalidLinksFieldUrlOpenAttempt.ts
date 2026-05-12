type CaptureInvalidLinksFieldUrlOpenAttemptArgs = {
  fieldName: string;
  recordId: string;
  url: string;
};

export const captureInvalidLinksFieldUrlOpenAttempt = async ({
  fieldName,
  recordId,
  url,
}: CaptureInvalidLinksFieldUrlOpenAttemptArgs) => {
  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setTag('feature', 'record-table-cell-secondary-action');
      scope.setContext('invalidLinksFieldUrlOpenAttempt', {
        fieldName,
        hasProtocol: /^\w+:/.test(url),
        recordId,
        urlLength: url.length,
      });

      captureMessage('Invalid links field URL prevented from opening');

      return scope;
    });
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.warn('Failed to capture invalid links field URL open attempt:', error);
  }
};
