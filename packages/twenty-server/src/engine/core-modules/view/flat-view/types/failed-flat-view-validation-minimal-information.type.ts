import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export type FailedFlatViewValidationMinimalInformation = Partial<
  Pick<FlatView, 'id' | 'name' | 'objectMetadataId'>
>;
