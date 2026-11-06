import { isDefined } from 'twenty-shared/utils';
import { getChartDefaultFieldSelection } from '@/page-layout/utils/getChartDefaultFieldSelection';
import {
  AggregateOperations,
  GraphOrderBy,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getFieldIdOrThrow = (objectNameSingular: string, fieldName: string) => {
  const field = getMockObjectMetadataItemOrThrow(
    objectNameSingular,
  ).fields.find((field) => field.name === fieldName);

  if (!isDefined(field)) {
    throw new Error(`Field ${fieldName} not found`);
  }

  return field.id;
};

describe('getChartDefaultFieldSelection', () => {
  it('should sum the first amount-like field grouped by the first select field', () => {
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

    expect(getChartDefaultFieldSelection(opportunity)).toEqual({
      objectMetadataId: opportunity.id,
      aggregateFieldMetadataId: getFieldIdOrThrow('opportunity', 'amount'),
      aggregateOperation: AggregateOperations.SUM,
      groupByFieldMetadataId: getFieldIdOrThrow('opportunity', 'stage'),
      groupByOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
    });
  });

  it('should count the label identifier field when no field can be summed', () => {
    const person = getMockObjectMetadataItemOrThrow('person');

    expect(getChartDefaultFieldSelection(person)).toMatchObject({
      aggregateFieldMetadataId: person.labelIdentifierFieldMetadataId,
      aggregateOperation: AggregateOperations.COUNT,
    });
  });

  it('should leave the fields unset when the object has no field the user can read', () => {
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

    expect(
      getChartDefaultFieldSelection({ ...opportunity, readableFields: [] }),
    ).toEqual({
      objectMetadataId: opportunity.id,
      aggregateFieldMetadataId: undefined,
      aggregateOperation: AggregateOperations.COUNT,
      groupByFieldMetadataId: undefined,
      groupByOrderBy: undefined,
    });
  });
});
