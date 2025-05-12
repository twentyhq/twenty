import { FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';

import { ThemeColor } from 'twenty-ui/theme';
import {
    Field,
    Object as MetadataObject,
    RelationDefinition,
    RelationMetadataType,
} from '~/generated-metadata/graphql';

export type FieldMetadataItemOption = {
  color: ThemeColor;
  id: string;
  label: string;
  position: number;
  value: string;
};

export type FieldMetadataItem = Omit<
  Field,
  '__typename' | 'defaultValue' | 'options' | 'relationDefinition'
> & {
  __typename?: string;
  defaultValue?: any;
  options?: FieldMetadataItemOption[] | null;
  relationDefinition?: {
    relationId: RelationDefinition['relationId'];
    direction: RelationMetadataType;
    sourceFieldMetadata: Pick<Field, 'id' | 'name'>;
    sourceObjectMetadata: Pick<
      MetadataObject,
      'id' | 'nameSingular' | 'namePlural'
    >;
    targetFieldMetadata: Pick<Field, 'id' | 'name'>;
    targetObjectMetadata: Pick<
      MetadataObject,
      'id' | 'nameSingular' | 'namePlural'
    >;
  } | null;
  settings?: FieldDateMetadataSettings;
  isLabelSyncedWithName?: boolean | null;
};
