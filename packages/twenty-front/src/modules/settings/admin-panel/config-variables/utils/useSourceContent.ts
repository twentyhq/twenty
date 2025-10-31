import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { CustomError } from 'twenty-shared/utils';

import { ConfigSource } from '~/generated/graphql';

export const useSourceContent = (source: ConfigSource) => {
  const { t } = useLingui();
  const theme = useTheme();

  switch (source) {
    case ConfigSource.DATABASE:
      return {
        text: t`Stored in database`,
        color: theme.color.blue10,
      };
    case ConfigSource.ENVIRONMENT:
      return {
        text: t`Environment variable`,
        color: theme.color.green10,
      };
    case ConfigSource.DEFAULT:
      return {
        text: t`Default value`,
        color: theme.font.color.tertiary,
      };
    default:
      throw new CustomError(`Unknown source: ${source}`, 'UNKNOWN_SOURCE');
  }
};
