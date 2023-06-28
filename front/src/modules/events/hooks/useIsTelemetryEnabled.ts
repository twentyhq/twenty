export function useIsTelemetryEnabled() {
  // TODO: replace by clientConfig
  return process.env.TELEMETRY_ENABLED !== 'false';
}
