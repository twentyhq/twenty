import { styled } from '@linaria/react';

import { Modal, Section } from 'twenty-ui/layout';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledAppModal = styled(Modal)`
  border-radius: ${themeCssVariables.spacing[1]};
  width: calc(400px - ${themeCssVariables.spacing[32]});
  height: auto;
`;

export const StyledAppModalButton = styled(Button)`
  box-sizing: border-box;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const StyledAppModalTitle = styled.div`
  text-align: center;
`;

export const StyledAppModalSection = styled(Section)`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;
