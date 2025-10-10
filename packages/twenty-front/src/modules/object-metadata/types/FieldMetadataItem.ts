import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';

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
  '__typename' | 'defaultValue' | 'options' | 'relation' | 'morphRelations'
> & {
  __typename?: string;
  defaultValue?: any;
  options?: FieldMetadataItemOption[] | null;
  relation?: FieldMetadataItemRelation | null;
  morphRelations?: FieldMetadataItemRelation[] | null;
  settings?: FieldDateMetadataSettings | FieldMetadataMultiItemSettings | null;
  isLabelSyncedWithName?: boolean | null;
};
