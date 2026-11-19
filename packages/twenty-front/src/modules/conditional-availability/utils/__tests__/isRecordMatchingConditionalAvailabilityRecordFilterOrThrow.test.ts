import { getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier';
import { isRecordMatchingConditionalAvailabilityRecordFilterOrThrow } from '@/conditional-availability/utils/isRecordMatchingConditionalAvailabilityRecordFilterOrThrow';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import {
  type ConditionalAvailabilityRecordFilter,
  RecordFilterOperand,
} from 'twenty-shared/types';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const CURRENT_WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const OTHER_RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const recordFilterFieldByUniversalIdentifier =
  getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier({
    objectMetadataItems,
  });

const [firstCompanyRecordNode] = mockedCompanyRecords;
const company = {
  ...getRecordFromRecordNode({ recordNode: firstCompanyRecordNode }),
  name: 'Acme Corporation',
  employees: 120,
  idealCustomerProfile: true,
  accountOwnerId: CURRENT_WORKSPACE_MEMBER_ID,
  annualRecurringRevenue: { amountMicros: 5000000, currencyCode: 'USD' },
  createdAt: '2026-01-15T10:30:00.000Z',
};

const buildRecordFilter = ({
  fieldName,
  subFieldName = null,
  operand,
  value = '',
}: {
  fieldName: string;
  subFieldName?: ConditionalAvailabilityRecordFilter['subFieldName'];
  operand: RecordFilterOperand;
  value?: string;
}): ConditionalAvailabilityRecordFilter => ({
  fieldMetadataUniversalIdentifier: getMockFieldMetadataItemOrThrow({
    objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
    fieldName,
  }).universalIdentifier,
  subFieldName,
  operand,
  value,
});

const isMatching = ({
  record,
  recordFilter,
}: {
  record: unknown;
  recordFilter: ConditionalAvailabilityRecordFilter;
}) =>
  isRecordMatchingConditionalAvailabilityRecordFilterOrThrow({
    record,
    recordFilter,
    recordFilterFieldByUniversalIdentifier,
    objectMetadataItems,
    filterValueDependencies: {
      currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
      timeZone: 'UTC',
    },
  });

describe('isRecordMatchingConditionalAvailabilityRecordFilterOrThrow', () => {
  it.each([
    {
      title: 'a text that is the value',
      fieldName: 'name',
      operand: RecordFilterOperand.IS,
      value: 'Acme Corporation',
      expected: true,
    },
    {
      title: 'a text that contains the value in another case',
      fieldName: 'name',
      operand: RecordFilterOperand.CONTAINS,
      value: 'acme',
      expected: true,
    },
    {
      title: 'a number at least the value',
      fieldName: 'employees',
      operand: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
      value: '120',
      expected: true,
    },
    {
      title: 'a number above the "at most" value',
      fieldName: 'employees',
      operand: RecordFilterOperand.LESS_THAN_OR_EQUAL,
      value: '100',
      expected: false,
    },
    {
      title: 'a checked boolean',
      fieldName: 'idealCustomerProfile',
      operand: RecordFilterOperand.IS,
      value: 'true',
      expected: true,
    },
    {
      title: 'an amount at least the value in units',
      fieldName: 'annualRecurringRevenue',
      subFieldName: 'amountMicros' as const,
      operand: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
      value: '5',
      expected: true,
    },
    {
      title: 'a currency among the values',
      fieldName: 'annualRecurringRevenue',
      subFieldName: 'currencyCode' as const,
      operand: RecordFilterOperand.IS,
      value: '["EUR","USD"]',
      expected: true,
    },
    {
      title: 'an owner who is the current workspace member',
      fieldName: 'accountOwner',
      operand: RecordFilterOperand.IS,
      value: '{"isCurrentWorkspaceMemberSelected":true,"selectedRecordIds":[]}',
      expected: true,
    },
    {
      title: 'an owner who is not among the given members',
      fieldName: 'accountOwner',
      operand: RecordFilterOperand.IS,
      value: `{"isCurrentWorkspaceMemberSelected":false,"selectedRecordIds":["${OTHER_RECORD_ID}"]}`,
      expected: false,
    },
    {
      title: 'an owner that is set, asked as empty',
      fieldName: 'accountOwner',
      operand: RecordFilterOperand.IS_EMPTY,
      expected: false,
    },
    {
      title: 'a date and time inside the given day',
      fieldName: 'createdAt',
      operand: RecordFilterOperand.IS,
      value: '2026-01-15',
      expected: true,
    },
    {
      title: 'a date and time before the given day',
      fieldName: 'createdAt',
      operand: RecordFilterOperand.IS_BEFORE,
      value: '2026-01-16T00:00:00.000Z',
      expected: true,
    },
    {
      title: 'a date and time in the past',
      fieldName: 'createdAt',
      operand: RecordFilterOperand.IS_IN_PAST,
      expected: true,
    },
  ])('should answer $expected for $title', ({ expected, ...recordFilter }) => {
    expect(
      isMatching({
        record: company,
        recordFilter: buildRecordFilter(recordFilter),
      }),
    ).toBe(expected);
  });

  it('should refuse a field that does not exist', () => {
    expect(() =>
      isMatching({
        record: company,
        recordFilter: {
          fieldMetadataUniversalIdentifier: OTHER_RECORD_ID,
          subFieldName: null,
          operand: RecordFilterOperand.IS_NOT_EMPTY,
          value: '',
        },
      }),
    ).toThrow('The field of the rule does not exist');
  });

  it.each([
    RecordFilterOperand.DOES_NOT_CONTAIN,
    RecordFilterOperand.IS_NOT,
    RecordFilterOperand.IS_EMPTY,
  ])(
    'should refuse a record that does not hold the field, for the operand %s',
    (operand) => {
      const { name: _name, ...companyWithoutName } = company;

      expect(() =>
        isMatching({
          record: companyWithoutName,
          recordFilter: buildRecordFilter({
            fieldName: 'name',
            operand,
            value: operand === RecordFilterOperand.IS_EMPTY ? '' : 'globex',
          }),
        }),
      ).toThrow('The record does not hold the field');
    },
  );

  it('should refuse a relation whose join column the record does not hold', () => {
    const { accountOwnerId: _accountOwnerId, ...companyWithoutOwner } = company;

    expect(() =>
      isMatching({
        record: companyWithoutOwner,
        recordFilter: buildRecordFilter({
          fieldName: 'accountOwner',
          operand: RecordFilterOperand.IS_EMPTY,
        }),
      }),
    ).toThrow('The record does not hold the field');
  });

  it('should refuse a filter that reads as no filter at all', () => {
    expect(() =>
      isMatching({
        record: company,
        recordFilter: buildRecordFilter({
          fieldName: 'accountOwner',
          operand: RecordFilterOperand.IS,
          value:
            '{"isCurrentWorkspaceMemberSelected":false,"selectedRecordIds":[]}',
        }),
      }),
    ).toThrow('The rule cannot be read as a filter');
  });
});
