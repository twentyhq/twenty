import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';

import { ConfigSource } from '~/generated/graphql';

export const useSourceContent = (source: ConfigSource) => {
  const { t } = useLingui();
  const theme = useTheme();

  if (source === ConfigSource.DATABASE) {
    return {
      text: t`Stored in database`,
      color: theme.color.blue50,
    };
  } else if (source === ConfigSource.ENVIRONMENT) {
    return {
      text: t`Environment variable`,
      color: theme.color.green50,
    };
  } else {
    return {
      text: t`Default value`,
      color: theme.font.color.tertiary,
    };
  }
};
