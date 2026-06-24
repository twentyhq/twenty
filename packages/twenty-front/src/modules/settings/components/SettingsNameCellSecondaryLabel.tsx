import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

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

type SettingsNameCellSecondaryLabelProps = {
  children: ReactNode;
  title?: string;
};

export const SettingsNameCellSecondaryLabel = ({
  children,
  title,
}: SettingsNameCellSecondaryLabelProps) => (
  <StyledSettingsNameCellSecondaryLabel title={title}>
    {children}
  </StyledSettingsNameCellSecondaryLabel>
);
