import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export type FailedFlatViewFieldValidationMinimalInformation = Partial<
  Pick<FlatViewField, 'id' | 'fieldMetadataId' | 'viewId'>
>;
