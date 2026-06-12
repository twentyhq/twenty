export const ALLOWED_SDK_MODULES = ['core', 'metadata'] as const;

export type SdkModuleName = (typeof ALLOWED_SDK_MODULES)[number];
