import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';

import { type ThemeColor } from 'twenty-ui/theme';
import { type Field } from '~/generated-metadata/graphql';

export type FieldMetadataItemOption = {
  color: ThemeColor;
  id: string;
  label: string;
  position: number;
  value: string;
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
  settings?: FieldDateMetadataSettings;
  isLabelSyncedWithName?: boolean | null;
};
