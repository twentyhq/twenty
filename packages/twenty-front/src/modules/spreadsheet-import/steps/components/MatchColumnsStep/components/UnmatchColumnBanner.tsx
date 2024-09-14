import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Banner, IconChevronDown, IconInfoCircle } from 'twenty-ui';

const StyledBanner = styled(Banner)`
  background: ${({ theme }) => theme.accent.secondary};
  border-radius: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(2.5)};
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.color.blue};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTransitionedIconChevronDown = styled(IconChevronDown)<{
  isExpanded: boolean;
}>`
  color: ${({ theme }) => theme.color.blue};
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: ${({ theme }) =>
    `transform ${theme.animation.duration.normal}s ease`};
  cursor: pointer;
`;

export const UnmatchColumnBanner = ({
  message,
  isExpanded,
  buttonOnClick,
}: {
  message: string;
  isExpanded: boolean;
  buttonOnClick?: () => void;
}) => {
  const theme = useTheme();
  return (
    <StyledBanner>
      <IconInfoCircle color={theme.color.blue} size={theme.icon.size.md} />
      <StyledText>{message}</StyledText>
      {buttonOnClick && (
        <StyledTransitionedIconChevronDown
          isExpanded={isExpanded}
          onClick={buttonOnClick}
          size={theme.icon.size.md}
        />
      )}
    </StyledBanner>
  );
};
