import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsApplicationNotFoundProps = {
  message: string;
  action?: ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  text-align: center;
`;

export const SettingsApplicationNotFound = ({
  message,
  action,
}: SettingsApplicationNotFoundProps) => {
  return (
    <StyledContainer role="status">
      <div>{message}</div>
      {isDefined(action) && action}
    </StyledContainer>
  );
};
