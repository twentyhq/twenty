import * as Sentry from '@sentry/node';

export function SentryCronMonitor(monitorSlug: string, schedule: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!Sentry.isInitialized()) {
      return descriptor;
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        Sentry.captureCheckIn(
          {
            monitorSlug,
            status: 'in_progress',
          },
          {
            schedule: {
              type: 'crontab',
              value: schedule,
            },
            checkinMargin: 1,
            maxRuntime: 1,
            timezone: 'UTC',
          },
        );
        const result = await originalMethod.apply(this, args);

        Sentry.captureCheckIn({
          monitorSlug,
          status: 'ok',
        });

        return result;
      } catch (error) {
        Sentry.captureCheckIn({
          monitorSlug,
          status: 'error',
        });
        throw error;
      }
    };

    return descriptor;
  };
}
