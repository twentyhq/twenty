import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';

export type FrontComponentFieldsNeededToStartLoading = Pick<
  FlatFrontComponent,
  | 'id'
  | 'applicationId'
  | 'builtComponentChecksum'
  | 'usesSdkClient'
  | 'frontComponentSharedDependenciesChecksum'
>;
