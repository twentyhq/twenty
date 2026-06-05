// Single source of truth for which configured sinks are actually usable.
// Shared by the producer side (EventLogEmitterService.isEnabled, to avoid enqueuing
// jobs that would be dropped) and the consumer side (the EVENT_SINKS provider).
export const KNOWN_SINK_NAMES = ['clickhouse', 'console'] as const;

export const getAvailableSinkNames = (
  configuredSinkNames: string[],
  { hasClickhouseUrl }: { hasClickhouseUrl: boolean },
): string[] =>
  configuredSinkNames.filter((name) => {
    const lowerCasedName = name.toLowerCase();

    // clickhouse only resolves when a URL is configured; console is always available.
    if (lowerCasedName === 'clickhouse') {
      return hasClickhouseUrl;
    }

    if (lowerCasedName === 'console') {
      return true;
    }

    return false;
  });
