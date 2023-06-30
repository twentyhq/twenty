export function useIsTelemetryEnabled() {
  // TODO: replace by clientConfig
  return process.env.IS_TELEMETRY_ENABLED !== 'false';
}
