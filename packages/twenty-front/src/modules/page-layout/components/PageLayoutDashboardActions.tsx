import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { IconPrinter } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding: 0 8px 8px;

  @media print {
    display: none;
  }
`;

export const PageLayoutDashboardActions = () => {
  const handlePrintDashboard = () => {
    window.print();
  };

  return (
    <StyledContainer data-print-hidden>
      <Button
        Icon={IconPrinter}
        onClick={handlePrintDashboard}
        size="small"
        title={t`Print dashboard`}
        variant="secondary"
      />
    </StyledContainer>
  );
};
