import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isNull } from '@sniptt/guards';
import { PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

// GraphQL returns null for every unset optional setting, which the shared configuration types only allow on a few keys
export const removeNonNullableNullsFromWidgetConfiguration = <
  TConfiguration extends PageLayoutWidget['configuration'],
>(
  configuration: TConfiguration,
): TConfiguration => {
  // The server can send a configuration type this front does not know yet
  const nullableKeys: Partial<Record<string, true>> | undefined =
    PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE[
      configuration.configurationType
    ];

  return Object.fromEntries(
    Object.entries(configuration).filter(
      ([key, value]) => !isNull(value) || isDefined(nullableKeys?.[key]),
    ),
  ) as TConfiguration;
};
