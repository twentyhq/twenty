import { conditionalAvailabilityParser, isDefined } from 'twenty-shared/utils';

const LEGACY_PAGE_EDIT_MODE_IDENTIFIER = 'isPageInEditMode';
const DASHBOARD_PAGE_LAYOUT_EDIT_MODE_IDENTIFIER =
  'isDashboardPageLayoutInEditMode';
const DASHBOARD_PAGE_LAYOUT_EDIT_MODE_EXPRESSION =
  conditionalAvailabilityParser.parse(
    DASHBOARD_PAGE_LAYOUT_EDIT_MODE_IDENTIFIER,
  );

export const replaceLegacyPageEditModeIdentifier = (
  conditionalAvailabilityExpression: string | null,
) => {
  if (!isDefined(conditionalAvailabilityExpression)) {
    return conditionalAvailabilityExpression;
  }

  try {
    const parsedConditionalAvailabilityExpression =
      conditionalAvailabilityParser.parse(conditionalAvailabilityExpression);

    if (
      !parsedConditionalAvailabilityExpression
        .variables()
        .includes(LEGACY_PAGE_EDIT_MODE_IDENTIFIER)
    ) {
      return conditionalAvailabilityExpression;
    }

    return parsedConditionalAvailabilityExpression
      .substitute(
        LEGACY_PAGE_EDIT_MODE_IDENTIFIER,
        DASHBOARD_PAGE_LAYOUT_EDIT_MODE_EXPRESSION,
      )
      .toString();
  } catch {
    return conditionalAvailabilityExpression;
  }
};
