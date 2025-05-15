import { ThemeProvider, useTheme } from '@emotion/react';
import isEmpty from 'lodash.isempty';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/layout';
import { THEME_LIGHT } from 'twenty-ui/theme';

export const NoChats = () => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={isEmpty(theme) ? THEME_LIGHT : theme}>
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Send a message
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            Search for a member and start chatting
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </ThemeProvider>
  );
};
