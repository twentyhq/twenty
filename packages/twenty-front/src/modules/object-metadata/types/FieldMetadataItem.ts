import { FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';

import { ThemeColor } from 'twenty-ui/theme';
import { Field } from '~/generated-metadata/graphql';

export type FieldMetadataItemOption = {
  color: ThemeColor;
  id: string;
  label: string;
  position: number;
  value: string;
};

export type FieldMetadataItem = Omit<
  Field,
  '__typename' | 'defaultValue' | 'options' | 'relation'
> & {
  __typename?: string;
  defaultValue?: any;
  options?: FieldMetadataItemOption[] | null;
  relation?: FieldMetadataItemRelation | null;
  settings?: FieldDateMetadataSettings;
  isLabelSyncedWithName?: boolean | null;
};
