import styled from '@emotion/styled';
import { IconChevronLeft } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;

  flex-direction: row;
`;

const StyledTextContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};

  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(0.2)};
`;

type CommandMenuSubPageNavigationHeaderProps = {
  title: string;
  onBackClick: () => void;
};

export const CommandMenuSubPageNavigationHeader = ({
  onBackClick,
  title,
}: CommandMenuSubPageNavigationHeaderProps) => {
  return (
    <StyledContainer>
      <IconButton
        onClick={onBackClick}
        Icon={IconChevronLeft}
        variant="tertiary"
      />
      <StyledTextContainer>{title}</StyledTextContainer>
    </StyledContainer>
  );
};
