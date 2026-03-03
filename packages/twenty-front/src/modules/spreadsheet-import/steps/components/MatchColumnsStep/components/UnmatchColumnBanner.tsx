import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Banner, IconChevronDown, IconInfoCircle } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBanner = styled(Banner)<{ allMatched: boolean }>`
  background: ${({ allMatched }) =>
    allMatched
      ? themeCssVariables.accent.secondary
      : themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 10px;
`;

const StyledText = styled.div<{ allMatched: boolean }>`
  color: ${({ allMatched }) =>
    allMatched
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconChevronDownWrapper = styled.div<{
  isExpanded: boolean;
  allMatched: boolean;
}>`
  align-items: center;
  color: ${({ allMatched }) =>
    allMatched
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledBanner allMatched={allMatched}>
      <IconInfoCircle
        color={allMatched ? theme.color.blue : theme.font.color.secondary}
        size={theme.icon.size.md}
      />
      {isDefined(buttonOnClick) ? (
        <StyledClickableContainer onClick={buttonOnClick}>
          <StyledText allMatched={allMatched}>{message}</StyledText>
          <StyledIconChevronDownWrapper
            isExpanded={isExpanded}
            allMatched={allMatched}
          >
            <IconChevronDown size={theme.icon.size.md} />
          </StyledIconChevronDownWrapper>
        </StyledClickableContainer>
      ) : (
        <StyledText allMatched={allMatched}>{message}</StyledText>
      )}
    </StyledBanner>
  );
};
