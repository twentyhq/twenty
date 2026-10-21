import { styled } from '@linaria/react';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconChevronDown } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledTriggerButton = styled.button`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  text-align: start;
  width: 100%;

  > svg {
    flex-shrink: 0;
    transition: transform
      calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  }

  &[data-panel-open] > svg {
    transform: rotate(180deg);
  }
`;

const StyledText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type UnmatchColumnBannerProps = {
  message: string;
  allMatched: boolean;
};

export const UnmatchColumnBanner = ({
  message,
  allMatched,
}: UnmatchColumnBannerProps) => {
  const theme = useTheme();

  return (
    <InlineBanner embedded color={allMatched ? 'blue' : 'gray'}>
      <Collapsible.Trigger render={<StyledTriggerButton />}>
        <StyledText>{message}</StyledText>
        <IconChevronDown size={theme.icon.size.md} />
      </Collapsible.Trigger>
    </InlineBanner>
  );
};
