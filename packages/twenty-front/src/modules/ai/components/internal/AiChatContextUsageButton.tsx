import { getAiChatUsageLabel } from '@/ai/utils/getAiChatUsageLabel';
import { formatAiChatTokens } from '@/ai/utils/formatAiChatTokens';
import { FloatingPortal, useTransitionStyles } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { ProgressRing } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { IconWindow, IconGauge } from 'twenty-ui/icon';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatContextUsageDetails } from '@/ai/components/internal/AiChatContextUsageDetails';
import { useAiChatHoverCard } from '@/ai/hooks/useAiChatHoverCard';
import { useAiChatUsage } from '@/ai/hooks/useAiChatUsage';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { StyledInformationCard } from '@/ui/layout/information-card/components/StyledInformationCard';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledTrigger = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  padding: 0;
  width: 24px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
  }
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[1]};
`;

export const AiChatContextUsageButton = () => {
  const { t } = useLingui();

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

  const agentChatUsage = useAtomComponentFamilyStateValue(
    agentChatUsageComponentFamilyState,
    { threadId: currentAiChatThread },
  );

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

  const limitValue = creditUsage?.limitValue ?? null;

  const progress = isDefined(limitValue)
    ? computeUsageLimitProgress({
        limitValue,
        consumedValue: creditUsage?.consumedValue ?? null,
      })
    : null;

  const creditPercentage =
    limitValue === 0 ? 100 : (progress?.consumedPercentage ?? null);

  const daysUntilReset = isDefined(creditUsage?.periodEnd)
    ? Math.max(
        0,
        Math.ceil(
          (new Date(creditUsage.periodEnd).getTime() - Date.now()) / 86400000,
        ),
      )
    : null;

  const usageLabelInput = {
    loading,
    hasError: isDefined(error),
    hasUsage: isDefined(creditUsage),
    daysUntilReset,
    creditPercentage,
  };

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: shouldReduceMotion ? 0 : { open: 150, close: 100 },
    initial: { opacity: 0 },
  });

  return (
    <>
      <StyledTrigger
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
      </StyledTrigger>
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
              startIcon={IconWindow}
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
            {!isWorkspaceSetupChat && (
              <MetricRow
                startIcon={IconGauge}
                progress={
                  loading || isDefined(error) ? 0 : (creditPercentage ?? 0)
                }
                value={getAiChatUsageLabel(usageLabelInput)}
                progressValueText={getAiChatUsageLabel({
                  ...usageLabelInput,
                  unavailableConsumptionLabel: t`Not available`,
                })}
                progressColor={getUsageLimitRingColor({
                  consumedPercentage: creditPercentage ?? 0,
                  isExhausted: creditPercentage === 100,
                })}
              >
                {t`Usage`}
              </MetricRow>
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
