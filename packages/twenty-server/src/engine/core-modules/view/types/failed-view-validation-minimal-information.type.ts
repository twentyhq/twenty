import { type FlatView } from 'src/engine/core-modules/view/types/flat-view.type';

export type FailedViewValidationMinimalInformation = Partial<
  Pick<FlatView, 'id' | 'name' | 'objectMetadataId'>
>;
