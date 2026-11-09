import { DASHBOARD_FILTER_AUTOMATIC_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterAutomaticOptionValue';
import { DASHBOARD_FILTER_NOT_APPLIED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterNotAppliedOptionValue';
import {
  AMOUNT_FIELD,
  CLOSE_DATE_FIELD,
  INACTIVE_DATE_FIELD,
  OBJECT_FIELDS,
  PERIOD_FILTER,
  SIGNED_AT_FIELD,
} from '@/page-layout/testing/dashboardFilterWidgetFixtures';
import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { getDashboardFilterWidgetSetting } from '@/page-layout/utils/getDashboardFilterWidgetSetting';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const getSetting = ({
  fieldMetadataId,
  fields = OBJECT_FIELDS,
  configuration = TEST_BAR_CHART_CONFIGURATION,
}: {
  fieldMetadataId?: string | null;
  fields?: typeof OBJECT_FIELDS;
  configuration?:
    | typeof TEST_BAR_CHART_CONFIGURATION
    | typeof TEST_AGGREGATE_CHART_CONFIGURATION;
}) =>
  getDashboardFilterWidgetSetting({
    pageLayoutFilter: PERIOD_FILTER,
    bindings:
      fieldMetadataId === undefined
        ? []
        : [{ pageLayoutFilterId: PERIOD_FILTER.id, fieldMetadataId }],
    candidateFieldMetadataIds:
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration,
        viewFilterFieldMetadataIds: [],
      }),
    fields,
  });

const getSelectedLabel = ({ value, options }: ReturnType<typeof getSetting>) =>
  options.find((option) => option.value === value)?.label;

describe('getDashboardFilterWidgetSetting', () => {
  it('should offer automatic with its field, the active bindable dates and not applied', () => {
    const { value, options } = getSetting({});

    expect(value).toBe(DASHBOARD_FILTER_AUTOMATIC_OPTION_VALUE);
    expect(options.map(({ label }) => label)).toEqual([
      'Automatic (Close date)',
      'Close date',
      'Signed at',
      'Creation date',
      'Not applied',
    ]);
  });

  it('should select the override and keep the automatic field in its label', () => {
    const { value, resolution, options } = getSetting({
      fieldMetadataId: SIGNED_AT_FIELD.id,
    });

    expect(value).toBe(SIGNED_AT_FIELD.id);
    expect(resolution.source).toBe('OVERRIDE');
    expect(options[0].label).toBe('Automatic (Close date)');
  });

  it('should select not applied for an exclusion', () => {
    expect(getSetting({ fieldMetadataId: null }).value).toBe(
      DASHBOARD_FILTER_NOT_APPLIED_OPTION_VALUE,
    );
  });

  it('should keep a deactivated override selectable', () => {
    const { value, options } = getSetting({
      fieldMetadataId: INACTIVE_DATE_FIELD.id,
    });

    expect(value).toBe(INACTIVE_DATE_FIELD.id);
    expect(options.map((option) => option.value)).toContain(
      INACTIVE_DATE_FIELD.id,
    );
  });

  it('should say a widget without a date field is not filtered', () => {
    const { resolution, options } = getSetting({
      configuration: TEST_AGGREGATE_CHART_CONFIGURATION,
      fields: [AMOUNT_FIELD],
    });

    expect(resolution.source).toBe('UNRESOLVED');
    expect(options.map(({ label }) => label)).toEqual([
      'Not filtered (no date field)',
      'Not applied',
    ]);
  });

  it('should name the date the chart groups by in the automatic label', () => {
    expect(getSetting({}).options[0]).toEqual({
      value: DASHBOARD_FILTER_AUTOMATIC_OPTION_VALUE,
      label: `Automatic (${CLOSE_DATE_FIELD.label})`,
      iconName: CLOSE_DATE_FIELD.icon,
    });
  });
});

describe('getDashboardFilterWidgetSetting with an unusable override', () => {
  it('should show a stale override as an unavailable field and keep the other choices', () => {
    const setting = getSetting({
      fieldMetadataId: 'deleted-field',
      fields: [CLOSE_DATE_FIELD],
    });

    expect(setting.resolution.source).toBe('UNRESOLVED');
    expect(getSelectedLabel(setting)).toBe('Unavailable field');
    expect(setting.options.map(({ label }) => label)).toEqual([
      'Automatic (Close date)',
      'Unavailable field',
      'Close date',
      'Not applied',
    ]);
  });

  it('should show an override to a field that can no longer be bound as unavailable', () => {
    const setting = getSetting({ fieldMetadataId: AMOUNT_FIELD.id });

    expect(getSelectedLabel(setting)).toBe('Unavailable field');
    expect(
      setting.options.filter(({ value }) => value === AMOUNT_FIELD.id),
    ).toHaveLength(1);
  });
});
