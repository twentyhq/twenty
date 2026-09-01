import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

export const WorkspaceRouteUnavailable = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      {children ?? t`This page isn't available.`}
    </StyledContainer>
  );
};
