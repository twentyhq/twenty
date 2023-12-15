import { ThemeColor } from '@/ui/theme/constants/colors';
import { Field, Relation } from '~/generated-metadata/graphql';

export type FieldMetadataItem = Omit<
  Field,
  'fromRelationMetadata' | 'toRelationMetadata' | 'defaultValue' | 'options'
> & {
  fromRelationMetadata?:
    | (Pick<Relation, 'id' | 'toFieldMetadataId' | 'relationType'> & {
        toObjectMetadata: Pick<
          Relation['toObjectMetadata'],
          'id' | 'nameSingular' | 'namePlural'
        >;
      })
    | null;
  toRelationMetadata?:
    | (Pick<Relation, 'id' | 'fromFieldMetadataId' | 'relationType'> & {
        fromObjectMetadata: Pick<
          Relation['fromObjectMetadata'],
          'id' | 'nameSingular' | 'namePlural'
        >;
      })
    | null;
  defaultValue?: unknown;
  options?: {
    color: ThemeColor;
    id: string;
    label: string;
    position: number;
    value: string;
  }[];
};
