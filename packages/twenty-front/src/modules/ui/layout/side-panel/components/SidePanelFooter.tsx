import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type SidePanelFooterProps = {
  actions: React.ReactNode[];
};

export const SidePanelFooter = ({ actions }: SidePanelFooterProps) => {
  return (
    <StyledContainer>
      {actions.map((action, index) => (
        <Fragment key={index}>{action}</Fragment>
      ))}
    </StyledContainer>
  );
};
