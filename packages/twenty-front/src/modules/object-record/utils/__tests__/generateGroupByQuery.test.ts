import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';

describe('generateGroupByQuery', () => {
  const testCases = [
    {
      description: 'single aggregate operation',
      objectMetadataItem: {
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
      },
      aggregateOperations: ['sumAmountAmountMicros'],
    },
    {
      description: 'multiple aggregate operations',
      objectMetadataItem: {
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
      },
      aggregateOperations: [
        'totalCount',
        'sumAmountAmountMicros',
        'avgAmountAmountMicros',
      ],
    },
    {
      description: 'empty aggregate operations',
      objectMetadataItem: {
        nameSingular: 'person',
        namePlural: 'people',
      },
      aggregateOperations: [],
    },
  ];

  it.each(testCases)(
    'should generate valid GraphQL query for $description',
    ({ objectMetadataItem, aggregateOperations }) => {
      const result = generateGroupByAggregateQuery({
        objectMetadataItem: objectMetadataItem as ObjectMetadataItem,
        aggregateOperationGqlFields: aggregateOperations,
      });

      expect(result.loc?.source.body).toMatchSnapshot();
    },
  );
});
