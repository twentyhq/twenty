/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { Tag } from 'twenty-ui/components';
import { Theme } from '~ui/theme/context';

const StyledContainer = styled.div``;

const IndexSidePanel = () => {
  return (
    <Theme>
      <StyledContainer>
        <Tag color="blue" text="hello world"></Tag>
      </StyledContainer>
    </Theme>
  );
};

export default IndexSidePanel;
