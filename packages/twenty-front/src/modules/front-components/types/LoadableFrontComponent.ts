import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';

export type LoadableFrontComponent = Pick<
  FlatFrontComponent,
  | 'id'
  | 'applicationId'
  | 'builtComponentChecksum'
  | 'usesSdkClient'
  | 'frontComponentSharedDependenciesChecksum'
>;
