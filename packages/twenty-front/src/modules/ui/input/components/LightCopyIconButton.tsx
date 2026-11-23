import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { LightCopyIconButtonWithoutPadding } from '@/ui/input/components/LightCopyIconButtonWithoutPadding';

const StyledButtonContainer = styled.div`
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export type LightCopyIconButtonProps = {
  copyText: string;
};

export const LightCopyIconButton = ({ copyText }: LightCopyIconButtonProps) => (
  <StyledButtonContainer>
    <LightCopyIconButtonWithoutPadding copyText={copyText} />
  </StyledButtonContainer>
);
