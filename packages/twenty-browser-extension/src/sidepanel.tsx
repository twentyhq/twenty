/** @jsxImportSource @emotion/react */
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { useState } from "react";
import { Tag } from "twenty-ui/components";
import { THEME_DARK, ThemeContextProvider } from "twenty-ui/theme";

const StyledContainer = styled.div`
  width: 400px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function IndexSidePanel() {
  const [data, setData] = useState("");

  return (
    <ThemeProvider theme={THEME_DARK}>
      <ThemeContextProvider theme={THEME_DARK}>
        <StyledContainer>
          <Tag color="blue" text="hello world"></Tag>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Welcome to your{' '}
            <a href="https://www.plasmo.com" target="_blank">
              Plasmo
            </a>{' '}
            Extension!
          </h2>
          <input
            onChange={(e) => setData(e.target.value)}
            value={data}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <a href="https://docs.plasmo.com" target="_blank" style={{ color: '#0066cc' }}>
            View Docs
          </a>
        </StyledContainer>
      </ThemeContextProvider>
    </ThemeProvider>
  );
}

export default IndexSidePanel;
