import {
  AI_SDK_PACKAGES,
  AI_SDK_PACKAGE_LABELS,
  type AiSdkPackage,
} from 'twenty-shared/ai';

export const SDK_PACKAGE_OPTIONS: Array<{
  value: AiSdkPackage;
  label: string;
}> = AI_SDK_PACKAGES.map((pkg) => ({
  value: pkg,
  label: AI_SDK_PACKAGE_LABELS[pkg],
}));
