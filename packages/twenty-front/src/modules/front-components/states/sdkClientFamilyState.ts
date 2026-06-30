import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type SdkClientBlobUrls = {
  core: string;
  metadata: string;
};

export type SdkClientState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; blobUrls: SdkClientBlobUrls }
  | { status: 'error'; error: Error };

export const sdkClientFamilyState = createAtomFamilyState<
  SdkClientState,
  string
>({
  key: 'sdkClientFamilyState',
  defaultValue: { status: 'idle' },
});
