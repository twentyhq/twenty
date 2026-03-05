import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import {
  type FieldDateMetadataSettings,
  type FieldRelationMetadataSettings,
} from '@/object-record/record-field/ui/types/FieldMetadata';

import {
  type FieldMetadataMultiItemSettings,
  type PartialFieldMetadataItemOption,
} from 'twenty-shared/types';
import { type ThemeColor } from 'twenty-ui/theme';
import { type Field } from '~/generated-metadata/graphql';

export type FieldMetadataItemOption = PartialFieldMetadataItemOption & {
  color: ThemeColor;
};

export type FieldMetadataItem = Omit<
  Field,
  | '__typename'
  | 'applicationId'
  | 'defaultValue'
  | 'options'
  | 'relation'
  | 'morphRelations'
> & {
  __typename?: string;
  applicationId?: string;
  defaultValue?: any;
  options?: FieldMetadataItemOption[] | null;
  relation?: FieldMetadataItemRelation | null;
  morphRelations?: FieldMetadataItemRelation[] | null;
  settings?:
    | FieldDateMetadataSettings
    | FieldMetadataMultiItemSettings
    | FieldRelationMetadataSettings
    | null;
  isLabelSyncedWithName?: boolean | null;
  morphId?: string | null;
};
