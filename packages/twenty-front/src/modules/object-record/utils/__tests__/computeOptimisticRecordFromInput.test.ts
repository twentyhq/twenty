import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('computeOptimisticRecordFromInput', () => {
  it('should generate correct relation mutation', () => {
    const relationField: Partial<FieldMetadataItem> = {
      createdAt: '',
      id: '20202020-83a5-404f-a99c-29a1d499a468',
      name: 'Company',
      type: FieldMetadataType.RELATION,
      relationDefinition: {
        direction: RelationDefinitionType.MANY_TO_ONE,
      } as FieldMetadataItem['relationDefinition'],
    };
    const firstOccurence = generatedMockObjectMetadataItems[0];
    const tmp = {
      ...firstOccurence,
      fields: [...firstOccurence.fields, relationField],
      companyId: relationField.id,
    };

    const result = computeOptimisticRecordFromInput({
      objectMetadataItem,
      recordInput,
    });
  });
});
