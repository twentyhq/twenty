import { ViewFilterOperand } from 'twenty-shared/types';
import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { getWidgetDashboardFilterHeaderContent } from '@/page-layout/utils/getWidgetDashboardFilterHeaderContent';

const APPLIED: WidgetDashboardFilterIndicator = {
  pageLayoutFilterId: 'date-range',
  label: 'Date range',
  hasValue: true,
  kind: 'APPLIED',
  fieldLabel: 'Close date',
  overlapsWidgetFilter: false,
  replacedWidgetConditions: [],
};
const IGNORED: WidgetDashboardFilterIndicator = {
  pageLayoutFilterId: 'date-range',
  label: 'Date range',
  hasValue: true,
  kind: 'IGNORED',
};
const UNAVAILABLE: WidgetDashboardFilterIndicator = {
  ...IGNORED,
  kind: 'UNAVAILABLE',
};

const getContent = (
  indicator: WidgetDashboardFilterIndicator,
  isPageLayoutInEditMode = false,
) =>
  getWidgetDashboardFilterHeaderContent({
    indicators: [indicator],
    isPageLayoutInEditMode,
  });

describe('getWidgetDashboardFilterHeaderContent', () => {
  it('should only offer the field on hover for a widget that follows the filter', () => {
    expect(getContent(APPLIED)).toEqual({
      fieldLabels: [],
      pills: [],
      hoverIndicatorText: 'Date range · Close date',
    });
  });

  it('should show nothing in view mode while the filter has no value', () => {
    expect(getContent({ ...IGNORED, hasValue: false })).toEqual({
      fieldLabels: [],
      pills: [],
      hoverIndicatorText: null,
    });
  });

  it('should show an ignored pill and no field indicator', () => {
    expect(getContent(IGNORED)).toEqual({
      fieldLabels: [],
      pills: [
        {
          pageLayoutFilterId: 'date-range',
          kind: 'IGNORED',
          text: 'Ignores Date range',
          tooltip: "The Date range filter doesn't apply to this widget.",
        },
      ],
      hoverIndicatorText: null,
    });
  });

  it('should explain an unavailable field in the pill tooltip', () => {
    expect(getContent(UNAVAILABLE).pills).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        kind: 'UNAVAILABLE',
        text: 'Date range field unavailable',
        tooltip:
          "The date field chosen for Date range on this widget is unavailable. Pick another one in the widget's settings.",
      },
    ]);
  });

  it('should say a widget without any date field has none', () => {
    const noDateField: WidgetDashboardFilterIndicator = {
      ...IGNORED,
      kind: 'NO_DATE_FIELD',
    };

    expect(getContent(noDateField).pills).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        kind: 'NO_DATE_FIELD',
        text: 'Ignores Date range',
        tooltip: 'This widget has no date field for Date range.',
      },
    ]);
    expect(getContent(noDateField, true).fieldLabels).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        kind: 'NO_DATE_FIELD',
        text: 'No date field',
        fullText: 'Date range · No date field',
      },
    ]);
  });

  it('should show an overlap pill next to the field indicator', () => {
    expect(getContent({ ...APPLIED, overlapsWidgetFilter: true })).toEqual({
      fieldLabels: [],
      pills: [
        {
          pageLayoutFilterId: 'date-range',
          kind: 'OVERLAP',
          text: 'Also filtered on Close date',
          tooltip: "This widget's own filter also uses Close date. Both apply.",
        },
      ],
      hoverIndicatorText: 'Date range · Close date',
    });
  });

  it('should always label the resolved field in edit mode, value or not', () => {
    expect(
      getContent({ ...APPLIED, hasValue: false }, true).fieldLabels,
    ).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        kind: 'APPLIED',
        text: 'Close date',
        fullText: 'Date range · Close date',
      },
    ]);
    expect(getContent(IGNORED, true)).toEqual({
      fieldLabels: [
        {
          pageLayoutFilterId: 'date-range',
          kind: 'IGNORED',
          text: 'Ignored',
          fullText: 'Date range · Ignored',
        },
      ],
      pills: [],
      hoverIndicatorText: null,
    });
    expect(getContent(UNAVAILABLE, true).fieldLabels).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        kind: 'UNAVAILABLE',
        text: 'Unavailable field',
        fullText: 'Date range · Unavailable field',
      },
    ]);
  });

  it.each([
    [
      'the period it replaces',
      [{ operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_QUARTER' }],
      'Date range · Close date, instead of This quarter',
    ],
    [
      "the widget's own period for a from–to pair",
      [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-04-01' },
      ],
      "Date range · Close date, instead of this widget's own period",
    ],
    [
      "the widget's own period for a day",
      [{ operand: ViewFilterOperand.IS, value: '2026-01-01' }],
      "Date range · Close date, instead of this widget's own period",
    ],
  ])(
    'should name %s on hover, with no pill',
    (_title, replacedWidgetConditions, hoverIndicatorText) => {
      expect(getContent({ ...APPLIED, replacedWidgetConditions })).toEqual({
        fieldLabels: [],
        pills: [],
        hoverIndicatorText,
      });
    },
  );

  it('should name the replaced period in the edit-mode label tooltip', () => {
    expect(
      getContent(
        {
          ...APPLIED,
          replacedWidgetConditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_QUARTER' },
          ],
        },
        true,
      ).fieldLabels,
    ).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        kind: 'APPLIED',
        text: 'Close date',
        fullText: 'Date range · Close date, instead of This quarter',
      },
    ]);
  });
});
