import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledSettingsNameCellSecondaryLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex: 0 999 auto;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: '·';
    margin-right: ${themeCssVariables.spacing[1]};
  }
`;

export const SettingsNameCellSecondaryLabel =
  StyledSettingsNameCellSecondaryLabel;
