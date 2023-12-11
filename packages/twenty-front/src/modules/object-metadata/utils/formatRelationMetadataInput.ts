import { RelationType } from '@/settings/data-model/types/RelationType';
import {
  CreateRelationInput,
  Field,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

import { formatFieldMetadataItemInput } from './formatFieldMetadataItemInput';

export type FormatRelationMetadataInputParams = {
  relationType: RelationType;
  field: Pick<Field, 'label' | 'icon' | 'description'>;
  objectMetadataId: string;
  connect: {
    field: Pick<Field, 'label' | 'icon'>;
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
    ? RelationMetadataType.OneToMany
    : (input.relationType as RelationMetadataType);
  const { field: fromField, objectMetadataId: fromObjectMetadataId } =
    isManyToOne ? input.connect : input;
  const { field: toField, objectMetadataId: toObjectMetadataId } = isManyToOne
    ? input
    : input.connect;

  const {
    description,
    icon: fromIcon,
    label: fromLabel,
    name: fromName,
  } = formatFieldMetadataItemInput(fromField);
  const {
    icon: toIcon,
    label: toLabel,
    name: toName,
  } = formatFieldMetadataItemInput(toField);

  return {
    description,
    fromIcon,
    fromLabel,
    fromName,
    fromObjectMetadataId,
    relationType,
    toIcon,
    toLabel,
    toName,
    toObjectMetadataId,
  };
};
