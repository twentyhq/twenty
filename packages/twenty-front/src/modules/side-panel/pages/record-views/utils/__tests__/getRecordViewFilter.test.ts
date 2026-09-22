import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { getRecordViewFilter } from '@/side-panel/pages/record-views/utils/getRecordViewFilter';
import { type View } from '@/views/types/View';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  ViewFilterGroupLogicalOperator,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const company = getMockObjectMetadataItemOrThrow('company');
const person = getMockObjectMetadataItemOrThrow('person');
const nameField = company.fields.find((field) => field.name === 'name')!;
const personCompanyField = person.fields.find(
  (field) => field.name === 'company',
)!;
const view: View = {
  id: 'view-id',
  name: 'Companies',
  type: ViewType.TABLE,
  objectMetadataId: company.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconTable',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};
const recordId = 'a6f02b36-6957-4ed2-b794-7430372ab562';
const dependencies = { timeZone: 'Europe/Paris' };
const getFilter = (overrides: Partial<View> = {}) =>
  getRecordViewFilter({
    view: { ...view, ...overrides },
    recordId,
    objectFields: company.fields,
    fieldMetadataItems: company.fields,
    filterValueDependencies: dependencies,
  });
const matches = (
  filter: ReturnType<typeof getFilter>,
  record: Record<string, unknown>,
) =>
  isRecordMatchingFilter({
    record: { id: recordId, deletedAt: null, ...record },
    filter,
    objectMetadataItem: company,
    objectMetadataItems: [company],
  });

describe('getRecordViewFilter', () => {
  it('restricts even an unfiltered view to the requested record', () => {
    expect(matches(getFilter(), {})).toBe(true);
    expect(matches(getFilter(), { id: 'another-record' })).toBe(false);
  });

  it('keeps grouped OR conditions scoped to the requested record', () => {
    const filter = getFilter({
      viewFilters: ['Acme', 'Twenty'].map((value, index) => ({
        id: `filter-${index}`,
        fieldMetadataId: nameField.id,
        operand: ViewFilterOperand.CONTAINS,
        value,
        viewFilterGroupId: 'group',
        positionInViewFilterGroup: index,
      })),
      viewFilterGroups: [
        {
          id: 'group',
          viewId: view.id,
          logicalOperator: ViewFilterGroupLogicalOperator.OR,
        },
      ],
    });
    expect(matches(filter, { name: 'Acme' })).toBe(true);
    expect(matches(filter, { name: 'Twenty' })).toBe(true);
    expect(matches(filter, { name: 'Other' })).toBe(false);
    expect(matches(filter, { id: 'another-record', name: 'Acme' })).toBe(false);
  });

  it('includes saved search text', () => {
    const filter = getFilter({ anyFieldFilterValue: 'Acme' });
    expect(filter).not.toEqual(getFilter());
    expect(JSON.stringify(filter)).toContain('Acme');
  });

  it('preserves relation traversal for server-side evaluation', () => {
    const filter = getRecordViewFilter({
      view: {
        ...view,
        objectMetadataId: person.id,
        viewFilters: [
          {
            id: 'relation-filter',
            fieldMetadataId: personCompanyField.id,
            relationTargetFieldMetadataId: nameField.id,
            operand: ViewFilterOperand.CONTAINS,
            value: 'Acme',
          },
        ],
      },
      recordId,
      objectFields: person.fields,
      fieldMetadataItems: [...person.fields, ...company.fields],
      filterValueDependencies: dependencies,
    });
    expect(filter).toEqual({
      and: [
        { id: { eq: recordId } },
        { company: { name: { ilike: '%Acme%' } } },
      ],
    });
  });

  it('resolves relative dates using the same date filter machinery as the view', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-22T12:00:00Z'));
    try {
      const createdAtField = company.fields.find(
        (field) => field.name === 'createdAt',
      )!;
      const filter = getFilter({
        viewFilters: [
          {
            id: 'recent',
            fieldMetadataId: createdAtField.id,
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'PAST_7_DAY;;UTC;;',
          },
        ],
      });
      expect(matches(filter, { createdAt: '2026-09-21T12:00:00Z' })).toBe(true);
      expect(matches(filter, { createdAt: '2026-08-01T12:00:00Z' })).toBe(
        false,
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('fails instead of silently dropping a filter with missing metadata', () => {
    expect(() =>
      getFilter({
        viewFilters: [
          {
            id: 'missing',
            fieldMetadataId: 'unavailable-field',
            operand: ViewFilterOperand.CONTAINS,
            value: 'Acme',
          },
        ],
      }),
    ).toThrow('Unable to resolve view filters');
  });
});
