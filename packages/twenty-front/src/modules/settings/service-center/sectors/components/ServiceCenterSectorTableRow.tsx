import styled from '@emotion/styled';
import { OverflowingTextWithTooltip, useIcons } from 'twenty-ui/display';

import { useTheme } from '@emotion/react';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
  overflow: auto;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
`;

type ServiceCenterSectorTableRowProps = {
  sectorName: string;
  sectorIcon: string;
  accessory?: React.ReactNode;
};

export const ServiceCenterSectorTableRow = ({
  sectorName,
  sectorIcon,
  accessory,
}: ServiceCenterSectorTableRowProps) => {
  const { getIcon } = useIcons();
  const theme = useTheme();

  const Icon = getIcon(sectorIcon);

  return (
    <StyledContainer>
      <StyledIconContainer>
        {Icon && <Icon size={theme.icon.size.md} />}
      </StyledIconContainer>
      <StyledContent>
        <OverflowingTextWithTooltip text={sectorName} />
      </StyledContent>
      {accessory}
    </StyledContainer>
  );
};
