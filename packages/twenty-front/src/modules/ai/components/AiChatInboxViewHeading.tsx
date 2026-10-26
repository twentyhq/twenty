import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useAgentChatInboxViewHeading } from '@/ai/hooks/useAgentChatInboxViewHeading';
import { RecordIndexPageHeaderTitle } from '@/object-record/record-index/components/RecordIndexPageHeaderTitle';

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  white-space: nowrap;
`;

const StyledChannelName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledChannelView = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

type AiChatInboxViewHeadingProps = {
  selectedThreadCount?: number;
};

export const AiChatInboxViewHeading = ({
  selectedThreadCount = 0,
}: AiChatInboxViewHeadingProps) => {
  const theme = useTheme();
  const { HeadingIcon, headingLabel, channelViewLabel } =
    useAgentChatInboxViewHeading();

  return (
    <StyledHeading>
      <HeadingIcon
        size={theme.icon.size.md}
        color={theme.font.color.tertiary}
      />
      {isDefined(channelViewLabel) ? (
        <>
          <StyledChannelName>{headingLabel}</StyledChannelName>
          <span aria-hidden>→</span>
          <StyledChannelView>
            <RecordIndexPageHeaderTitle
              label={channelViewLabel}
              numberOfSelectedRecords={selectedThreadCount}
            />
          </StyledChannelView>
        </>
      ) : (
        <RecordIndexPageHeaderTitle
          label={headingLabel}
          numberOfSelectedRecords={selectedThreadCount}
        />
      )}
    </StyledHeading>
  );
};
