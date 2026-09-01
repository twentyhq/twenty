export const isUsableJunctionConfig = <Config extends { isValid: boolean }>(
  junctionConfig: Config | null | undefined,
): junctionConfig is Config & { isValid: true } =>
  junctionConfig?.isValid === true;
