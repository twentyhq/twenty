import { useEffect, useState } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@emotion/react';
import isEmpty from 'lodash.isempty';
import { IconRefresh, THEME_LIGHT } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type GenericErrorFallbackProps = FallbackProps;

export const GenericErrorFallback = ({
  error,
  resetErrorBoundary,
}: GenericErrorFallbackProps) => {
  const location = useLocation();

  const [previousLocation] = useState(location);

  useEffect(() => {
    if (!isDeeplyEqual(previousLocation, location)) {
      resetErrorBoundary();
    }
  }, [previousLocation, location, resetErrorBoundary]);

  const theme = useTheme();

  return (
    <ThemeProvider theme={isEmpty(theme) ? THEME_LIGHT : theme}>
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="errorIndex" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Server’s on a coffee break
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {error.message}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconRefresh}
          title="Reload"
          variant={'secondary'}
          onClick={() => resetErrorBoundary()}
        />
      </AnimatedPlaceholderEmptyContainer>
    </ThemeProvider>
  );
};
