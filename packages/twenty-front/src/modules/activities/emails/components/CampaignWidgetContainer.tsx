import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledCampaignWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% + 2 * ${themeCssVariables.spacing[2]});
  margin: calc(-1 * ${themeCssVariables.spacing[2]})
    calc(-1 * var(--widget-card-padding-inline, 0px));
  min-height: 0;
`;
