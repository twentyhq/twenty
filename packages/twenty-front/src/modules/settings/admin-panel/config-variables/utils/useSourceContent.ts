import { useLingui } from '@lingui/react/macro';
import { CustomError } from 'twenty-shared/utils';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

import { ConfigSource } from '~/generated-metadata/graphql';

export const useSourceContent = (source: ConfigSource) => {
  const { t } = useLingui();

  switch (source) {
    case ConfigSource.DATABASE:
      return {
        text: t`Stored in database`,
        color: resolveThemeVariable(themeCssVariables.color.blue10),
      };
    case ConfigSource.ENVIRONMENT:
      return {
        text: t`Environment variable`,
        color: resolveThemeVariable(themeCssVariables.color.green10),
      };
    case ConfigSource.DEFAULT:
      return {
        text: t`Default value`,
        color: resolveThemeVariable(themeCssVariables.font.color.tertiary),
      };
    default:
      throw new CustomError(`Unknown source: ${source}`, 'UNKNOWN_SOURCE');
  }
};
