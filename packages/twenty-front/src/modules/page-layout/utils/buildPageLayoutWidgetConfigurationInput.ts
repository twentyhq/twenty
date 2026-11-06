import { removeTypenamesFromCompositeFieldValue } from '@/object-record/utils/removeTypenamesFromCompositeFieldValue';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isNull } from '@sniptt/guards';
import { PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

// GraphQL reads add __typename and return null for every unset optional setting; the input takes neither
export const buildPageLayoutWidgetConfigurationInput = (
  configuration: PageLayoutWidget['configuration'] | null | undefined,
): Record<string, unknown> | null => {
  if (!isDefined(configuration)) {
    return null;
  }

  const configurationWithoutTypenames = removeTypenamesFromCompositeFieldValue(
    configuration,
  ) as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(configurationWithoutTypenames).filter(
      ([key, value]) =>
        !isNull(value) ||
        isDefined(PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS[key]),
    ),
  );
};
