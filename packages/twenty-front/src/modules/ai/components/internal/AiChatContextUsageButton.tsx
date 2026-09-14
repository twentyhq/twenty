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
} from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { IconWindow, IconGauge } from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledHoverCard = styled.div`
  backdrop-filter: blur(20px);
  background: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  max-width: calc(100vw - 16px);
  width: 300px;
  z-index: ${themeCssVariables.lastLayerZIndex};
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[1]};
`;

export const AiChatContextUsageButton = () => {
  const { t } = useLingui();
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
      if (!open) setShowDetails(false);
    },
    placement: 'top-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
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
  const formatTokens = (value: number) =>
    formatNumber(value, { abbreviate: true, decimals: 1 });

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
      {isOpen && (
        <FloatingPortal>
          <StyledHoverCard
            ref={refs.setFloating}
            style={floatingStyles}
            aria-label={t`Context and usage`}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...getFloatingProps()}
          >
            <StyledRows>
              <UsageProgressRow
                Icon={IconWindow}
                label={t`Context window`}
                value={percentage}
                valueLabel={
                  contextWindow > 0
                    ? `(${formatTokens(conversationSize)}/${formatTokens(contextWindow)}) ${formatNumber(percentage, { decimals: 1 })}%`
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
                  valueLabel={
                    loading
                      ? t`Loading…`
                      : isDefined(error)
                        ? t`Not available`
                        : !isDefined(creditUsage)
                          ? t`No limit`
                          : isDefined(daysUntilReset) &&
                              isDefined(creditPercentage)
                            ? t`Reset in ${daysUntilReset} days (${formatNumber(creditPercentage, { decimals: 1 })}%)`
                            : !isDefined(creditPercentage)
                              ? '—'
                              : undefined
                  }
                  barColor={getUsageLimitRingColor({
                    consumedPercentage: creditPercentage ?? 0,
                    isExhausted: creditPercentage === 100,
                  })}
                />
              )}
              {showDetails && <AiChatContextUsageDetails />}
              <HorizontalSeparator noMargin />
              <StyledFooter>
                <Button
                  title={showDetails ? t`Less` : t`More`}
                  disabled={!isDefined(agentChatUsage)}
                  size="small"
                  variant="secondary"
                  onClick={() => setShowDetails(!showDetails)}
                />
              </StyledFooter>
            </StyledRows>
          </StyledHoverCard>
        </FloatingPortal>
      )}
    </>
  );
};
