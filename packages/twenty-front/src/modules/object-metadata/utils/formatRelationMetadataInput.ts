import { RelationType } from '@/settings/data-model/types/RelationType';
import {
  CreateRelationInput,
  Field,
  RelationDefinitionType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

import { formatFieldMetadataItemInput } from './formatFieldMetadataItemInput';

export type FormatRelationMetadataInputParams = {
  relationType: RelationType;
  field: Pick<Field, 'label' | 'icon' | 'description' | 'name'>;
  objectMetadataId: string;
  connect: {
    field: Pick<Field, 'label' | 'icon' | 'name'>;
    objectMetadataId: string;
  };
};

export const formatRelationMetadataInput = (
  input: FormatRelationMetadataInputParams,
): CreateRelationInput => {
  // /!\ MANY_TO_ONE does not exist on backend.
  // => Transform into ONE_TO_MANY and invert "from" and "to" data.
  const isManyToOne = input.relationType === 'MANY_TO_ONE';
  const relationType = isManyToOne
    ? RelationDefinitionType.OneToMany
    : (input.relationType as RelationDefinitionType);
  const { field: fromField, objectMetadataId: fromObjectMetadataId } =
    isManyToOne ? input.connect : input;
  const { field: toField, objectMetadataId: toObjectMetadataId } = isManyToOne
    ? input
    : input.connect;

  const {
    description: fromDescription,
    icon: fromIcon,
    label: fromLabel = '',
    name: fromName = '',
  } = formatFieldMetadataItemInput(fromField);
  const {
    description: toDescription,
    icon: toIcon,
    label: toLabel = '',
    name: toName = '',
  } = formatFieldMetadataItemInput(toField);

  return {
    fromDescription,
    fromIcon,
    fromLabel,
    fromName,
    fromObjectMetadataId,
    relationType: relationType as unknown as RelationMetadataType,
    toDescription,
    toIcon,
    toLabel,
    toName,
    toObjectMetadataId,
  };
};
