type IsFeatureEnabledParams = {
  isAvailable: boolean;
  settingValue: string | undefined;
};

export const isFeatureEnabled = ({
  isAvailable,
  settingValue,
}: IsFeatureEnabledParams): boolean => isAvailable && settingValue === 'true';
