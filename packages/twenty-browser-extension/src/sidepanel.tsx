/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { Tag } from 'twenty-ui/components';
import { Theme } from '~ui/theme/context';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  width: 400px;
`;

const IndexSidePanel = () => {
  return (
    <Theme>
      <StyledContainer>
        <Tag color="blue" text="hello world"></Tag>
        <h1>Hello World</h1>
      </StyledContainer>
    </Theme>
  );
};

export default IndexSidePanel;
