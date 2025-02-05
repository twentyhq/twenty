import { ThemeProvider, useTheme } from '@emotion/react';
import isEmpty from 'lodash.isempty';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  THEME_LIGHT,
} from 'twenty-ui';

export const NoSelectedChat = () => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={isEmpty(theme) ? THEME_LIGHT : theme}>
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyInbox" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No message
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            Select one of the chats to start sending messages.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </ThemeProvider>
  );
};
