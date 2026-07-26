import * as Sentry from '@sentry/node';

const REACT_ERRORED_SUSPENSE_BOUNDARY_MARKER = '<!--$!-->';

type MonitorEmailRenderingParams = {
  templateType: string;
  locale: string;
  html: string;
};

export const monitorEmailRendering = ({
  templateType,
  locale,
  html,
}: MonitorEmailRenderingParams): void => {
  const isEmpty = html.trim().length === 0;
  const containsErroredSuspenseBoundary = html.includes(
    REACT_ERRORED_SUSPENSE_BOUNDARY_MARKER,
  );

  if (!isEmpty && !containsErroredSuspenseBoundary) {
    return;
  }

  const renderStatus = isEmpty ? 'empty' : 'errored_suspense_boundary';
  const error = new Error('Email template rendered an invalid HTML body');
  error.name = 'EmailRenderError';

  Sentry.withScope((scope) => {
    scope.setTag('emailTemplate', templateType);
    scope.setTag('emailLocale', locale);
    scope.setTag('emailRenderStatus', renderStatus);
    scope.setExtra('emailHtmlLength', html.length);
    scope.setFingerprint(['email-render-failure', templateType]);
    scope.setLevel('error');
    Sentry.captureException(error);
  });
};
