import { ThemeProvider, useTheme } from '@emotion/react';
import isEmpty from 'lodash.isempty';
import { THEME_LIGHT } from 'twenty-ui';

import { useTranslation } from 'react-i18next';
import {
    AnimatedPlaceholder,
    AnimatedPlaceholderEmptyContainer,
    AnimatedPlaceholderEmptySubTitle,
    AnimatedPlaceholderEmptyTextContainer,
    AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui';

export const PermissionErrorFallback = () => {

  const { t } = useTranslation();

  const theme = useTheme();

  return (
    <ThemeProvider theme={isEmpty(theme) ? THEME_LIGHT : theme}>
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="errorIndex" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t('authorizationError')}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t('permissionErrorDescription')}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </ThemeProvider>
  );
};
