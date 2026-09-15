import { type HostFetchInput } from '@/types/HostFetchInput';
import { type HostFetchResult } from '@/types/HostFetchResult';

export type HostFetchFunction = (
  input: HostFetchInput,
) => Promise<HostFetchResult>;
