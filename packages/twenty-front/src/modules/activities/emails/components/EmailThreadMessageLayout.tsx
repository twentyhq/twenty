import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledThreadMessage = styled.div<{ hideBottomBorder?: boolean }>`
  border-bottom: ${({ hideBottomBorder }) =>
    hideBottomBorder
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[0]};
`;

const StyledHeader = styled.div<{ isClickable?: boolean }>`
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'auto')};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

type EmailThreadMessageLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  hideBottomBorder?: boolean;
  isRowClickable?: boolean;
  isHeaderClickable?: boolean;
  onRowClick?: () => void;
  onHeaderClick?: () => void;
};

export const EmailThreadMessageLayout = ({
  header,
  children,
  hideBottomBorder = false,
  isRowClickable = false,
  isHeaderClickable = false,
  onRowClick,
  onHeaderClick,
}: EmailThreadMessageLayoutProps) => (
  <StyledThreadMessage
    hideBottomBorder={hideBottomBorder}
    onClick={onRowClick}
    style={{ cursor: isRowClickable ? 'pointer' : 'auto' }}
  >
    <StyledHeader isClickable={isHeaderClickable} onClick={onHeaderClick}>
      {header}
    </StyledHeader>
    <StyledBody>{children}</StyledBody>
  </StyledThreadMessage>
);
