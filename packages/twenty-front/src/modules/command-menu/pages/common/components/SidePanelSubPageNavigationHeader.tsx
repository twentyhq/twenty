import { styled } from '@linaria/react';
import { IconChevronLeft } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[2]};
  height: 40px;
`;

const StyledText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type SidePanelSubPageNavigationHeaderProps = {
  title: string;
  onBackClick: () => void;
};

export const SidePanelSubPageNavigationHeader = ({
  onBackClick,
  title,
}: SidePanelSubPageNavigationHeaderProps) => {
  return (
    <StyledContainer>
      <IconButton
        onClick={onBackClick}
        Icon={IconChevronLeft}
        variant="tertiary"
        size="small"
      />
      <StyledText>{title}</StyledText>
    </StyledContainer>
  );
};
