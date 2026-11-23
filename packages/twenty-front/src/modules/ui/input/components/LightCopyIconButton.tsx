import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { LightCopyIconButtonBase } from '@/ui/input/components/LightCopyIconButtonBase';

const StyledButtonContainer = styled.div`
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export type LightCopyIconButtonProps = {
  copyText: string;
};

export const LightCopyIconButton = ({ copyText }: LightCopyIconButtonProps) => (
  <StyledButtonContainer>
    <LightCopyIconButtonBase copyText={copyText} />
  </StyledButtonContainer>
);
