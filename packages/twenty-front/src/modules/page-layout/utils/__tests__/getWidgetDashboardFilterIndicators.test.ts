import { getWidgetDashboardFilterIndicators } from '@/page-layout/utils/getWidgetDashboardFilterIndicators';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';

// Stored by a French editor: the built-in Date range still shows in the viewer's locale
const DATE_RANGE = { ...DASHBOARD_DATE_RANGE_FILTER, label: 'Période' };

const THIS_MONTH_VALUE = {
  pageLayoutFilterId: DATE_RANGE.id,
  type: PageLayoutFilterType.DATE,
  conditions: [
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
  ],
};

const CLOSE_DATE_FIELD = {
  id: 'close-date-id',
  name: 'closeDate',
  label: 'Close date',
  type: FieldMetadataType.DATE,
};
const CREATED_AT_FIELD = {
  id: 'created-at-id',
  name: 'createdAt',
  label: 'Created at',
  type: FieldMetadataType.DATE_TIME,
};

const getIndicators = ({
  bindings = [],
  widgetFilterFieldMetadataIds = [],
  overlapsWidgetFilter = false,
  values = [THIS_MONTH_VALUE],
  appliedFields,
}: {
  bindings?: { pageLayoutFilterId: string; fieldMetadataId: string | null }[];
  widgetFilterFieldMetadataIds?: string[];
  overlapsWidgetFilter?: boolean;
  values?: (typeof THIS_MONTH_VALUE)[];
  appliedFields?: [];
}) =>
  getWidgetDashboardFilterIndicators({
    dashboardFilters: { pageLayoutFilters: [DATE_RANGE], values },
    bindings,
    candidateFieldMetadataIds: {
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds,
    },
    appliedFields: appliedFields ?? [
      {
        pageLayoutFilterId: DATE_RANGE.id,
        fieldMetadataId: CREATED_AT_FIELD.id,
        source: 'CREATED_AT',
        overlapsWidgetFilter,
      },
    ],
    fields: [CLOSE_DATE_FIELD, CREATED_AT_FIELD],
  });

describe('getWidgetDashboardFilterIndicators', () => {
  it('should name the field a widget follows by default', () => {
    expect(getIndicators({})).toEqual([
      {
        pageLayoutFilterId: DATE_RANGE.id,
        label: 'Date range',
        hasValue: true,
        kind: 'APPLIED',
        fieldLabel: 'Created at',
        overlapsWidgetFilter: false,
      },
    ]);
  });

  it('should name an overridden field', () => {
    expect(
      getIndicators({
        bindings: [
          {
            pageLayoutFilterId: DATE_RANGE.id,
            fieldMetadataId: CLOSE_DATE_FIELD.id,
          },
        ],
      }),
    ).toMatchObject([{ kind: 'APPLIED', fieldLabel: 'Close date' }]);
  });

  it('should carry the overlap computed with the applied field', () => {
    expect(
      getIndicators({
        widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        overlapsWidgetFilter: true,
      }),
    ).toMatchObject([
      { kind: 'APPLIED', fieldLabel: 'Close date', overlapsWidgetFilter: true },
    ]);
  });

  it('should report an ignored widget', () => {
    expect(
      getIndicators({
        bindings: [
          { pageLayoutFilterId: DATE_RANGE.id, fieldMetadataId: null },
        ],
      }),
    ).toEqual([
      {
        pageLayoutFilterId: DATE_RANGE.id,
        label: 'Date range',
        hasValue: true,
        kind: 'IGNORED',
      },
    ]);
  });

  it('should report an override to an unavailable field', () => {
    expect(
      getIndicators({
        bindings: [
          {
            pageLayoutFilterId: DATE_RANGE.id,
            fieldMetadataId: 'deleted-field-id',
          },
        ],
      }),
    ).toMatchObject([{ kind: 'UNAVAILABLE' }]);
  });

  it('should resolve a filter without a value, with no overlap claim', () => {
    expect(
      getIndicators({
        widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
        values: [],
        appliedFields: [],
      }),
    ).toEqual([
      {
        pageLayoutFilterId: DATE_RANGE.id,
        label: 'Date range',
        kind: 'APPLIED',
        fieldLabel: 'Close date',
        hasValue: false,
      },
    ]);
  });

  it('should tell a widget without any date field from an unavailable override', () => {
    expect(
      getWidgetDashboardFilterIndicators({
        dashboardFilters: { pageLayoutFilters: [DATE_RANGE], values: [] },
        bindings: [],
        candidateFieldMetadataIds: {
          groupByFieldMetadataIds: [],
          widgetFilterFieldMetadataIds: [],
        },
        appliedFields: [],
        fields: [
          {
            id: 'name-id',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
          },
        ],
      }),
    ).toMatchObject([{ kind: 'NO_DATE_FIELD', hasValue: false }]);
  });
});
