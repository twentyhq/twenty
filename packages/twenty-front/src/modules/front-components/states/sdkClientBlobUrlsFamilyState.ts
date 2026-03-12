import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type SdkClientBlobUrls = {
  core: string;
  metadata: string;
};

export const sdkClientBlobUrlsFamilyState = createAtomFamilyState<
  SdkClientBlobUrls | null,
  string
>({
  key: 'sdkClientBlobUrlsFamilyState',
  defaultValue: null,
});
