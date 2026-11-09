import { t } from '@lingui/core/macro';

import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { type WidgetDashboardFilterHeaderContent } from '@/page-layout/types/WidgetDashboardFilterHeaderContent';
import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isNonEmptyArray,
  relativeDateFilterStringifiedSchema,
} from 'twenty-shared/utils';

const getFieldLabelText = (indicator: WidgetDashboardFilterIndicator) => {
  const { label } = indicator;

  switch (indicator.kind) {
    case 'APPLIED': {
      const { fieldLabel } = indicator;

      return t`${label} · ${fieldLabel}`;
    }
    case 'IGNORED':
      return t`${label} · Ignored`;
    case 'UNAVAILABLE':
      return t`${label} · Unavailable field`;
    case 'NO_DATE_FIELD':
      return t`${label} · No date field`;
  }
};

const getFieldIndicatorText = (indicator: WidgetDashboardFilterIndicator) => {
  if (
    indicator.kind !== 'APPLIED' ||
    !indicator.hasValue ||
    !isNonEmptyArray(indicator.replacedWidgetConditions)
  ) {
    return getFieldLabelText(indicator);
  }

  const { label, fieldLabel, replacedWidgetConditions } = indicator;
  const [replacedCondition] = replacedWidgetConditions;
  const relativeDateFilter =
    replacedWidgetConditions.length === 1 &&
    replacedCondition.operand === ViewFilterOperand.IS_RELATIVE
      ? relativeDateFilterStringifiedSchema.safeParse(replacedCondition.value)
      : undefined;

  if (!relativeDateFilter?.success) {
    return t`${label} · ${fieldLabel}, instead of this widget's own period`;
  }

  const { direction, amount, unit } = relativeDateFilter.data;
  const periodLabel = getRelativeDateDisplayValue({ direction, amount, unit });

  return t`${label} · ${fieldLabel}, instead of ${periodLabel}`;
};

const getFieldLabelShortText = (indicator: WidgetDashboardFilterIndicator) => {
  switch (indicator.kind) {
    case 'APPLIED':
      return indicator.fieldLabel;
    case 'IGNORED':
      return t`Ignored`;
    case 'UNAVAILABLE':
      return t`Unavailable field`;
    case 'NO_DATE_FIELD':
      return t`No date field`;
  }
};

const getPills = (
  indicator: WidgetDashboardFilterIndicator,
): WidgetDashboardFilterHeaderContent['pills'] => {
  const { pageLayoutFilterId, label } = indicator;

  switch (indicator.kind) {
    case 'IGNORED':
      return [
        {
          pageLayoutFilterId,
          kind: 'IGNORED',
          text: t`Ignores ${label}`,
          tooltip: t`The ${label} filter doesn't apply to this widget.`,
        },
      ];
    case 'UNAVAILABLE':
      return [
        {
          pageLayoutFilterId,
          kind: 'UNAVAILABLE',
          text: t`${label} field unavailable`,
          tooltip: t`The date field chosen for ${label} on this widget is unavailable. Pick another one in the widget's settings.`,
        },
      ];
    case 'NO_DATE_FIELD':
      return [
        {
          pageLayoutFilterId,
          kind: 'NO_DATE_FIELD',
          text: t`Ignores ${label}`,
          tooltip: t`This widget has no date field for ${label}.`,
        },
      ];
    case 'APPLIED': {
      if (!indicator.hasValue || !indicator.overlapsWidgetFilter) {
        return [];
      }

      const { fieldLabel } = indicator;

      return [
        {
          pageLayoutFilterId,
          kind: 'OVERLAP',
          text: t`Also filtered on ${fieldLabel}`,
          tooltip: t`This widget's own filter also uses ${fieldLabel}. Both apply.`,
        },
      ];
    }
  }
};

export const getWidgetDashboardFilterHeaderContent = ({
  indicators,
  isPageLayoutInEditMode,
}: {
  indicators: WidgetDashboardFilterIndicator[];
  isPageLayoutInEditMode: boolean;
}): WidgetDashboardFilterHeaderContent => {
  if (isPageLayoutInEditMode) {
    return {
      fieldLabels: indicators.map((indicator) => ({
        pageLayoutFilterId: indicator.pageLayoutFilterId,
        kind: indicator.kind,
        text: getFieldLabelShortText(indicator),
        fullText: getFieldIndicatorText(indicator),
      })),
      pills: [],
      hoverIndicatorText: null,
    };
  }

  const indicatorsWithValue = indicators.filter(({ hasValue }) => hasValue);
  const pills = indicatorsWithValue.flatMap(getPills);
  const appliedFieldLabelTexts = indicatorsWithValue
    .filter(({ kind }) => kind === 'APPLIED')
    .map(getFieldIndicatorText);
  const hasIgnoredPill = pills.some(({ kind }) => kind !== 'OVERLAP');

  return {
    fieldLabels: [],
    pills,
    hoverIndicatorText:
      hasIgnoredPill || !isNonEmptyArray(appliedFieldLabelTexts)
        ? null
        : appliedFieldLabelTexts.join(', '),
  };
};
