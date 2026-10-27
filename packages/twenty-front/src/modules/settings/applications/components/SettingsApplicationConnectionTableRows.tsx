import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTableRows = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsApplicationConnectionTableRowsProps = {
  children: ReactNode;
};

export const SettingsApplicationConnectionTableRows = ({
  children,
}: SettingsApplicationConnectionTableRowsProps) => (
  <StyledTableRows>{children}</StyledTableRows>
);
