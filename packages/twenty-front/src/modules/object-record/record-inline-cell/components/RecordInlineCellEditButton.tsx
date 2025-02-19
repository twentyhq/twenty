import styled from '@emotion/styled';
import {
  AnimatedContainer,
  FloatingIconButton,
  IconComponent,
} from 'twenty-ui';

const StyledInlineCellButtonContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const RecordInlineCellButton = ({ Icon }: { Icon: IconComponent }) => {
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer>
        <FloatingIconButton
          size="small"
          Icon={Icon}
          data-testid="inline-cell-edit-mode-container"
        />
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
