import { InboxThreadDetailsDropdown } from '@/ai/components/InboxThreadDetailsDropdown';
import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewInboxSlot';
import { useInboxThreadDisplayLabel } from '@/ai/hooks/useInboxThreadDisplayLabel';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const SidePanelAskAiInfo = () => {
  const { t } = useLingui();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isOnNewInboxSlot = useIsOnNewInboxSlot();
  const thread = useAtomFamilySelectorValue(
    inboxThreadRecordFamilySelector,
    currentInboxThread ?? '',
  );
  const displayLabel = useInboxThreadDisplayLabel({
    thread,
    fallbackLabel: t`Ask AI`,
  });

  return (
    <StyledContainer>
      <HeaderIdentifier title={displayLabel} />
      {isDefined(currentInboxThread) && !isOnNewInboxSlot && (
        <InboxThreadDetailsDropdown threadId={currentInboxThread} />
      )}
    </StyledContainer>
  );
};
