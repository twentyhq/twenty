import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown, IconInfoCircle } from 'twenty-ui';
const StyledBanner = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.accent.secondary};
  border-radius: 8px;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(2.5)};
  width: 100%;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 150%;
  box-sizing: border-box;
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
  transition: transform 0.4s ease;
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
