import { ThemeColor } from 'twenty-ui';

import {
  Field,
  Object as MetadataObject,
  RelationDefinition,
  RelationDefinitionType,
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
    direction: RelationDefinitionType;
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
  settings?: {
    displayAsRelativeDate?: boolean;
  };
  isLabelSyncedWithName?: boolean | null;
};
