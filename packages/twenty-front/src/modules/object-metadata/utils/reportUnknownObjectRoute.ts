type ReportUnknownObjectRouteInput = {
  objectNamePlural: string;
  pathname: string;
  objectMetadataItemsCount: number;
};

export const reportUnknownObjectRoute = async ({
  objectNamePlural,
  pathname,
  objectMetadataItemsCount,
}: ReportUnknownObjectRouteInput) => {
  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint(['unknown-object-route', objectNamePlural]);
      scope.setTag('object-name-plural', objectNamePlural);
      scope.setTag('route-path', pathname);
      scope.setContext('unknown-object-route', {
        objectNamePlural,
        pathname,
        objectMetadataItemsCount,
      });

      captureMessage('Unknown object route redirected to not found.');
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error('Failed to capture unknown object route:', sentryError);
  }
};
