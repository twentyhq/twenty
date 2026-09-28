import { getAiChatUsageLabel } from '@/ai/utils/getAiChatUsageLabel';
import { formatAiChatTokens } from '@/ai/utils/formatAiChatTokens';
import { useQuery } from '@apollo/client/react';
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { IconWindow, IconGauge } from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatContextUsageDetails } from '@/ai/components/internal/AiChatContextUsageDetails';
import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { StyledInformationCard } from '@/ui/layout/information-card/components/StyledInformationCard';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { GetAiChatUsageDocument } from '~/generated-metadata/graphql';
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

  const [isOpen, setIsOpen] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

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

  const { data, loading, error } = useQuery(GetAiChatUsageDocument, {
    skip: !isOpen || isWorkspaceSetupChat,
    fetchPolicy: 'network-only',
  });

  const creditUsage = data?.aiChatUsage;

  const limitValue = isDefined(creditUsage)
    ? Number(creditUsage.limitValue)
    : null;

  const consumedValue = isDefined(creditUsage?.consumedValue)
    ? Number(creditUsage?.consumedValue)
    : null;

  const progress = isDefined(limitValue)
    ? computeUsageLimitProgress({ limitValue, consumedValue })
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

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open);
      if (open) {
        setShowDetails(false);
      }
    },
    placement: 'top-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: shouldReduceMotion ? 0 : { open: 150, close: 100 },
    initial: { opacity: 0 },
  });

  const hover = useHover(context, { handleClose: safePolygon() });

  const focus = useFocus(context);

  const click = useClick(context);

  const dismiss = useDismiss(context);

  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <StyledTrigger
        ref={refs.setReference}
        type="button"
        aria-label={t`Context and usage`}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...getReferenceProps()}
      >
        <ContextUsageProgressRing percentage={percentage} />
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
            <UsageProgressRow
              Icon={IconWindow}
              label={t`Context window`}
              value={percentage}
              valueLabel={
                contextWindow > 0
                  ? `(${formatAiChatTokens(conversationSize)}/${formatAiChatTokens(contextWindow)}) ${formatNumber(percentage, { decimals: 1 })}%`
                  : t`Not available`
              }
              barColor={getUsageLimitRingColor({
                consumedPercentage: percentage,
                isExhausted: percentage >= 100,
              })}
            />
            {!isWorkspaceSetupChat && (
              <UsageProgressRow
                Icon={IconGauge}
                label={t`Usage`}
                value={
                  loading || isDefined(error) ? 0 : (creditPercentage ?? 0)
                }
                valueLabel={getAiChatUsageLabel({
                  loading,
                  hasError: isDefined(error),
                  hasUsage: isDefined(creditUsage),
                  daysUntilReset,
                  creditPercentage,
                })}
                barColor={getUsageLimitRingColor({
                  consumedPercentage: creditPercentage ?? 0,
                  isExhausted: creditPercentage === 100,
                })}
              />
            )}
            {showDetails && <AiChatContextUsageDetails />}
            {isDefined(agentChatUsage) && (
              <>
                <HorizontalSeparator noMargin />
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
