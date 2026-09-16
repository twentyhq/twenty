import { formatAiChatTokens } from '@/ai/utils/formatAiChatTokens';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import {
  IconArrowUp,
  IconArrowDown,
  IconCoins,
  IconHistory,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSectionTitle = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 20px;
`;

export const AiChatContextUsageDetails = () => {
  const { t } = useLingui();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatUsage = useAtomComponentFamilyStateValue(
    agentChatUsageComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  if (!isDefined(agentChatUsage)) {
    return null;
  }

  const lastMessage = agentChatUsage.lastMessage;

  return (
    <>
      {isDefined(lastMessage) && (
        <>
          <HorizontalSeparator noMargin />
          <StyledSection>
            <StyledSectionTitle>{t`Last message`}</StyledSectionTitle>
            <UsageProgressRow
              Icon={IconArrowUp}
              label={t`Input tokens`}
              value={null}
              valueLabel={formatAiChatTokens(lastMessage.inputTokens)}
            />
            <UsageProgressRow
              Icon={IconHistory}
              label={t`Cached input`}
              value={null}
              valueLabel={formatAiChatTokens(lastMessage.cachedInputTokens)}
            />
            <UsageProgressRow
              Icon={IconArrowDown}
              label={t`Output tokens`}
              value={null}
              valueLabel={formatAiChatTokens(lastMessage.outputTokens)}
            />
            <UsageProgressRow
              Icon={IconCoins}
              label={t`Credits`}
              value={null}
              valueLabel={formatNumber(
                lastMessage.inputCredits + lastMessage.outputCredits,
                { decimals: 3 },
              )}
            />
          </StyledSection>
        </>
      )}
      <HorizontalSeparator noMargin />
      <StyledSection>
        <StyledSectionTitle>{t`Conversation`}</StyledSectionTitle>
        <UsageProgressRow
          Icon={IconArrowUp}
          label={t`Input tokens`}
          value={null}
          valueLabel={formatAiChatTokens(agentChatUsage.inputTokens)}
        />
        <UsageProgressRow
          Icon={IconHistory}
          label={t`Cached input`}
          value={null}
          valueLabel={formatAiChatTokens(agentChatUsage.cachedInputTokens)}
        />
        <UsageProgressRow
          Icon={IconArrowDown}
          label={t`Output tokens`}
          value={null}
          valueLabel={formatAiChatTokens(agentChatUsage.outputTokens)}
        />
        <UsageProgressRow
          Icon={IconCoins}
          label={t`Credits`}
          value={null}
          valueLabel={formatNumber(
            agentChatUsage.inputCredits + agentChatUsage.outputCredits,
            { decimals: 3 },
          )}
        />
      </StyledSection>
    </>
  );
};
