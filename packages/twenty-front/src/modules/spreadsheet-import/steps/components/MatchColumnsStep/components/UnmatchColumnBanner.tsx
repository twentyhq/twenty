import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { Banner, IconChevronDown, IconInfoCircle } from 'twenty-ui/display';

const StyledBanner = styled(Banner)<{ allMatched: boolean }>`
  background: ${({ allMatched, theme }) =>
    allMatched ? theme.accent.secondary : theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(2.5)};
`;

const StyledText = styled.div<{ allMatched: boolean }>`
  color: ${({ allMatched, theme }) =>
    allMatched ? theme.color.blue : theme.font.color.secondary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTransitionedIconChevronDown = styled(IconChevronDown)<{
  isExpanded: boolean;
  allMatched: boolean;
}>`
  color: ${({ allMatched, theme }) =>
    allMatched ? theme.color.blue : theme.font.color.secondary};
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: ${({ theme }) =>
    `transform ${theme.animation.duration.normal}s ease`};
  cursor: pointer;
`;

const StyledClickableContainer = styled.div`
  cursor: pointer;
  display: flex;

  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

export const UnmatchColumnBanner = ({
  message,
  isExpanded,
  buttonOnClick,
  allMatched,
}: {
  message: string;
  isExpanded: boolean;
  buttonOnClick?: () => void;
  allMatched: boolean;
}) => {
  const theme = useTheme();

  return (
    <StyledBanner allMatched={allMatched}>
      <IconInfoCircle
        color={allMatched ? theme.color.blue : theme.font.color.secondary}
        size={theme.icon.size.md}
      />
      {isDefined(buttonOnClick) ? (
        <StyledClickableContainer onClick={buttonOnClick}>
          <StyledText allMatched={allMatched}>{message}</StyledText>
          <StyledTransitionedIconChevronDown
            isExpanded={isExpanded}
            allMatched={allMatched}
            size={theme.icon.size.md}
          />
        </StyledClickableContainer>
      ) : (
        <StyledText allMatched={allMatched}>{message}</StyledText>
      )}
    </StyledBanner>
  );
};
