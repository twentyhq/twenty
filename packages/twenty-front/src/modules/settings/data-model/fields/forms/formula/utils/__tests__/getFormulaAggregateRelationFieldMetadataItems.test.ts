import { FieldMetadataType } from 'twenty-shared/types';

import { getFormulaAggregateRelationFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateRelationFieldMetadataItems';
import { RelationType } from '~/generated-metadata/graphql';

const buildRelationField = ({
  name,
  relationType,
  isActive = true,
}: {
  name: string;
  relationType: RelationType;
  isActive?: boolean;
}) => ({
  name,
  isActive,
  type: FieldMetadataType.RELATION,
  relation: {
    type: relationType,
    sourceFieldMetadata: { id: `${name}-source`, name },
    targetFieldMetadata: { id: `${name}-target`, name: 'company' },
    sourceObjectMetadata: {
      id: 'company-id',
      nameSingular: 'company',
      namePlural: 'companies',
    },
    targetObjectMetadata: {
      id: `${name}-object-id`,
      nameSingular: name,
      namePlural: name,
    },
  },
});

describe('getFormulaAggregateRelationFieldMetadataItems', () => {
  it('should offer the active one-to-many relations only', () => {
    expect(
      getFormulaAggregateRelationFieldMetadataItems([
        buildRelationField({
          name: 'people',
          relationType: RelationType.ONE_TO_MANY,
        }),
        buildRelationField({
          name: 'accountOwner',
          relationType: RelationType.MANY_TO_ONE,
        }),
        buildRelationField({
          name: 'legacyDeals',
          relationType: RelationType.ONE_TO_MANY,
          isActive: false,
        }),
        {
          name: 'employees',
          isActive: true,
          type: FieldMetadataType.NUMBER,
          relation: null,
        },
      ]).map(({ name }) => name),
    ).toEqual(['people']);
  });
});
