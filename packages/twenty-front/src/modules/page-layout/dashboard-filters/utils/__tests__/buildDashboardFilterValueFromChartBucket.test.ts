import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildDashboardFilterValueFromChartBucket } from '@/page-layout/dashboard-filters/utils/buildDashboardFilterValueFromChartBucket';
import { isChartBucketFieldCrossFilterable } from '@/page-layout/dashboard-filters/utils/isChartBucketFieldCrossFilterable';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getFieldByNameOrThrow = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(
      `Expected the ${objectMetadataItem.nameSingular} mock to have a ${fieldName} field`,
    );
  }

  return field;
};

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const stageField = getFieldByNameOrThrow(
  opportunityObjectMetadataItem,
  'stage',
);
const companyField = getFieldByNameOrThrow(
  opportunityObjectMetadataItem,
  'company',
);
const closeDateField = getFieldByNameOrThrow(
  opportunityObjectMetadataItem,
  'closeDate',
);
const amountField = getFieldByNameOrThrow(
  opportunityObjectMetadataItem,
  'amount',
);
const nameField = getFieldByNameOrThrow(opportunityObjectMetadataItem, 'name');
const idealCustomerProfileField = getFieldByNameOrThrow(
  companyObjectMetadataItem,
  'idealCustomerProfile',
);
const workPreferenceField = getFieldByNameOrThrow(
  personObjectMetadataItem,
  'workPreference',
);
const opportunityIdField = getFieldByNameOrThrow(
  opportunityObjectMetadataItem,
  'id',
);
const createdByField = getFieldByNameOrThrow(
  companyObjectMetadataItem,
  'createdBy',
);

const ACME_COMPANY_ID = '20202020-0000-4000-8000-00000000ac3e';

describe('isChartBucketFieldCrossFilterable', () => {
  it('accepts fields whose bucket is a single IS filter and relations', () => {
    expect(
      isChartBucketFieldCrossFilterable({ fieldMetadataItem: stageField }),
    ).toBe(true);
    expect(
      isChartBucketFieldCrossFilterable({
        fieldMetadataItem: idealCustomerProfileField,
      }),
    ).toBe(true);
    expect(
      isChartBucketFieldCrossFilterable({ fieldMetadataItem: companyField }),
    ).toBe(true);
    expect(
      isChartBucketFieldCrossFilterable({
        fieldMetadataItem: amountField,
        subFieldName: 'currencyCode',
      }),
    ).toBe(true);
  });

  it('rejects date fields and fields whose bucket filter is CONTAINS', () => {
    expect(
      isChartBucketFieldCrossFilterable({ fieldMetadataItem: closeDateField }),
    ).toBe(false);
    expect(
      isChartBucketFieldCrossFilterable({ fieldMetadataItem: nameField }),
    ).toBe(false);
    expect(
      isChartBucketFieldCrossFilterable({
        fieldMetadataItem: workPreferenceField,
      }),
    ).toBe(false);
  });

  it('rejects ids, actor sub-fields and currency amounts even though their first operand is IS', () => {
    expect(
      isChartBucketFieldCrossFilterable({
        fieldMetadataItem: opportunityIdField,
      }),
    ).toBe(false);
    expect(
      isChartBucketFieldCrossFilterable({
        fieldMetadataItem: createdByField,
        subFieldName: 'source',
      }),
    ).toBe(false);
    expect(
      isChartBucketFieldCrossFilterable({
        fieldMetadataItem: amountField,
        subFieldName: 'amountMicros',
      }),
    ).toBe(false);
    expect(
      isChartBucketFieldCrossFilterable({ fieldMetadataItem: amountField }),
    ).toBe(false);
  });
});

describe('buildDashboardFilterValueFromChartBucket', () => {
  it('turns a select bucket into an IS filter on that option', () => {
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: stageField,
        bucketRawValue: 'NEW',
      }),
    ).toEqual({
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(['NEW']),
    });
  });

  it('turns a boolean bucket into an IS filter', () => {
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: idealCustomerProfileField,
        bucketRawValue: true,
      }),
    ).toEqual({ operand: ViewFilterOperand.IS, value: 'true' });
  });

  it('turns a currency code bucket into an IS filter on the sub-field', () => {
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: amountField,
        bucketRawValue: 'USD',
        subFieldName: 'currencyCode',
      }),
    ).toEqual({
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(['USD']),
    });
  });

  it('turns a relation bucket into the relation value of the related record', () => {
    const value = buildDashboardFilterValueFromChartBucket({
      fieldMetadataItem: companyField,
      bucketRawValue: ACME_COMPANY_ID,
    });

    expect(value?.operand).toBe(ViewFilterOperand.IS);
    expect(JSON.parse(value?.value ?? '')).toEqual({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: [ACME_COMPANY_ID],
    });
  });

  it('keeps the drilldown for date granularity buckets', () => {
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: closeDateField,
        bucketRawValue: '2024-03-01',
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      }),
    ).toBeUndefined();
  });

  it('keeps the drilldown for buckets whose filter would be CONTAINS', () => {
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: nameField,
        bucketRawValue: 'Acme',
      }),
    ).toBeUndefined();
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: workPreferenceField,
        bucketRawValue: 'REMOTE_WORK',
      }),
    ).toBeUndefined();
  });

  it('keeps the drilldown for the empty bucket', () => {
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: stageField,
        bucketRawValue: null,
      }),
    ).toBeUndefined();
    expect(
      buildDashboardFilterValueFromChartBucket({
        fieldMetadataItem: companyField,
        bucketRawValue: null,
      }),
    ).toBeUndefined();
  });
});
