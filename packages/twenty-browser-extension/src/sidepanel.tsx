/** @jsxImportSource @emotion/react */
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { Tag } from 'twenty-ui/components';
import { THEME_DARK, ThemeContextProvider } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  width: 400px;
`;

const IndexSidePanel = () => {
  return (
    <ThemeProvider theme={THEME_DARK}>
      <ThemeContextProvider theme={THEME_DARK}>
        <StyledContainer>
          <Tag color="blue" text="hello world"></Tag>
          <h1>Hello World</h1>
        </StyledContainer>
      </ThemeContextProvider>
    </ThemeProvider>
  );
};

export default IndexSidePanel;
