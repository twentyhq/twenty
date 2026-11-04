import { formatAiChatTokens } from '@/ai/utils/formatAiChatTokens';
import { FloatingPortal, useTransitionStyles } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import { ProgressRing } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { IconWindow, IconGauge, IconUser } from 'twenty-ui/icon';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatContextUsageDetails } from '@/ai/components/internal/AiChatContextUsageDetails';
import { AiChatUsageMetricRow } from '@/ai/components/internal/AiChatUsageMetricRow';
import { useAiChatHoverCard } from '@/ai/hooks/useAiChatHoverCard';
import { useAiChatUsage } from '@/ai/hooks/useAiChatUsage';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { StyledInformationCard } from '@/ui/layout/information-card/components/StyledInformationCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { formatNumber } from '@/localization/utils/formatNumber';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[1]};
`;

export const AiChatContextUsageButton = () => {
  const { t } = useLingui();
  const theme = useTheme();

  const shouldReduceMotion = useReducedMotion();

  const [showDetails, setShowDetails] = useState(false);

  const {
    isOpen,
    context,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
  } = useAiChatHoverCard({
    placement: 'top-start',
    role: 'dialog',
    onOpen: () => setShowDetails(false),
  });

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const agentChatUsage = useAtomFamilyStateValue(agentChatUsageFamilyState, {
    threadId: currentAiChatThread,
  });

  const tiers = useAiModelTiers();

  const { chatTier } = useWorkspaceAiModelTiers();

  const agentChatUserSelectedModelTier = useAtomStateValue(
    agentChatUserSelectedModelTierState,
  );

  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  const modelTier = isWorkspaceSetupChat
    ? 'fast'
    : (agentChatUserSelectedModelTier ?? chatTier);

  const contextWindow =
    agentChatUsage?.contextWindowTokens ??
    tiers.find(({ tier }) => tier === modelTier)?.model?.contextWindowTokens ??
    0;

  const conversationSize = agentChatUsage?.conversationSize ?? 0;

  const percentage =
    contextWindow > 0
      ? Math.min(100, Math.max(0, (conversationSize / contextWindow) * 100))
      : 0;

  const formattedPercentage = formatNumber(percentage, { decimals: 1 });

  const formattedConversationSize = formatAiChatTokens(conversationSize);

  const formattedContextWindow = formatAiChatTokens(contextWindow);

  const contextWindowRingColor = getUsageLimitRingColor({
    consumedPercentage: percentage,
    isExhausted: percentage >= 100,
  });

  const {
    usage: creditUsage,
    loading,
    error,
  } = useAiChatUsage({
    skip: !isOpen || isWorkspaceSetupChat,
    fetchPolicy: 'network-only',
  });

  const { userCreditsUsage } = useAiChatUserCreditsUsage({
    skip: !isOpen || isWorkspaceSetupChat,
  });

  const isPaidByWorkspaceCredits =
    !isDefined(userCreditsUsage) ||
    (userCreditsUsage.isExhausted &&
      userCreditsUsage.isFallingBackToWorkspaceCredits);

  const isAiLimitCharged =
    creditUsage?.kind === 'limit' && !userCreditsUsage?.isExhausted;

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: shouldReduceMotion ? 0 : { open: 150, close: 100 },
    initial: { opacity: 0 },
  });

  return (
    <>
      <LightIconButton
        size="sm"
        ref={refs.setReference}
        type="button"
        aria-label={
          contextWindow > 0
            ? t`Context and usage, ${formattedPercentage}% of context window used`
            : t`Context and usage, context window unavailable`
        }
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...getReferenceProps()}
      >
        <ProgressRing
          value={percentage}
          aria-hidden
          barColor={contextWindowRingColor}
          render={<span />}
        />
      </LightIconButton>
      {isMounted && (
        <FloatingPortal>
          <StyledInformationCard
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles }}
            aria-label={t`Context and usage`}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...getFloatingProps()}
          >
            <MetricRow
              startIcon={<IconWindow size={theme.icon.size.sm} />}
              progress={percentage}
              value={
                contextWindow > 0
                  ? `(${formattedConversationSize}/${formattedContextWindow}) ${formattedPercentage}%`
                  : t`Not available`
              }
              progressValueText={
                contextWindow > 0
                  ? t`${formattedPercentage}% used, ${formattedConversationSize} of ${formattedContextWindow} tokens`
                  : undefined
              }
              progressColor={contextWindowRingColor}
            >
              {t`Context window`}
            </MetricRow>
            {!isPaidByWorkspaceCredits && (
              <AiChatUsageMetricRow
                Icon={IconUser}
                label={t`Personal usage`}
                tooltip={t`Your own AI usage, separate from the workspace credits`}
                usage={userCreditsUsage}
              />
            )}
            {!isWorkspaceSetupChat &&
              (isPaidByWorkspaceCredits || isAiLimitCharged) && (
                <AiChatUsageMetricRow
                  Icon={IconGauge}
                  label={t`Usage`}
                  usage={creditUsage}
                  isLoading={loading}
                  hasError={isDefined(error)}
                />
              )}
            {showDetails && <AiChatContextUsageDetails />}
            {isDefined(agentChatUsage) && (
              <>
                <Separator />
                <StyledFooter>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? t`Less` : t`More`}
                  </Button>
                </StyledFooter>
              </>
            )}
          </StyledInformationCard>
        </FloatingPortal>
      )}
    </>
  );
};
