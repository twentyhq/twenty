import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Banner, IconChevronDown, IconInfoCircle } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBannerContainer = styled.div<{ allMatched: boolean }>`
  > div {
    background: ${({ allMatched }) =>
      allMatched
        ? themeCssVariables.accent.secondary
        : themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[2]} 10px;
  }
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
  align-items: center;
  cursor: pointer;

  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
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
    <StyledBannerContainer allMatched={allMatched}>
      <Banner>
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
      </Banner>
    </StyledBannerContainer>
  );
};
