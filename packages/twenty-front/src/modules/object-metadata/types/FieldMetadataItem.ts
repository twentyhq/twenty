import { ThemeColor } from '@/ui/theme/constants/colors';
import { Field, Relation } from '~/generated-metadata/graphql';

export type FieldMetadataItem = Omit<
  Field,
  | '__typename'
  | 'fromRelationMetadata'
  | 'toRelationMetadata'
  | 'defaultValue'
  | 'options'
> & {
  __typename?: string;
  fromRelationMetadata?:
    | (Pick<Relation, 'id' | 'toFieldMetadataId' | 'relationType'> & {
        toObjectMetadata: Pick<
          Relation['toObjectMetadata'],
          'id' | 'nameSingular' | 'namePlural' | 'isSystem'
        >;
      })
    | null;
  toRelationMetadata?:
    | (Pick<Relation, 'id' | 'fromFieldMetadataId' | 'relationType'> & {
        fromObjectMetadata: Pick<
          Relation['fromObjectMetadata'],
          'id' | 'nameSingular' | 'namePlural' | 'isSystem'
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
