import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useAgentChatInboxViewHeading } from '@/ai/hooks/useAgentChatInboxViewHeading';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { RecordIndexPageHeaderTitle } from '@/object-record/record-index/components/RecordIndexPageHeaderTitle';

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  white-space: nowrap;
`;

const StyledChannelHeading = styled(StyledHeading)`
  font-weight: ${themeCssVariables.font.weight.medium};
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
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();
  const { HeadingIcon, headingLabel, channelViewLabel } =
    useAgentChatInboxViewHeading();

  if (!isDefined(channelViewLabel)) {
    return (
      <StyledHeading>
        <HeadingIcon size={theme.icon.size.md} />
        <RecordIndexPageHeaderTitle
          label={headingLabel}
          numberOfSelectedRecords={selectedThreadCount}
        />
      </StyledHeading>
    );
  }

  return (
    <StyledChannelHeading>
      <HeadingIcon
        size={theme.icon.size.md}
        color={theme.font.color.tertiary}
      />
      <StyledChannelName>{headingLabel}</StyledChannelName>
      <span aria-hidden>→</span>
      <StyledChannelView>{channelViewLabel}</StyledChannelView>
      {selectedThreadCount > 0 && (
        <>
          <span aria-hidden>→</span>
          <StyledChannelView>
            {t`${formatNumber(selectedThreadCount)} selected`}
          </StyledChannelView>
        </>
      )}
    </StyledChannelHeading>
  );
};
