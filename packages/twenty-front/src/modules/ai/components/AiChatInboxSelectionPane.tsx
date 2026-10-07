import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxSelectionPile } from '@/ai/components/AiChatInboxSelectionPile';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

const StyledSelection = styled(EmptyState.Root)`
  box-sizing: border-box;
  gap: ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[10]} ${themeCssVariables.spacing[4]};
`;

const StyledButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

type AiChatInboxSelectionPaneProps = {
  selectedThreads: AgentChatThreadRecord[];
};

export const AiChatInboxSelectionPane = ({
  selectedThreads,
}: AiChatInboxSelectionPaneProps) => {
  const { t } = useLingui();
  const { resetRecordSelection } = useResetRecordSelection();
  const { openSidePanelMenu } = useSidePanelMenu();

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: resetRecordSelection,
    containsModifier: false,
    dependencies: [resetRecordSelection],
  });

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          title={plural(selectedThreads.length, {
            one: '# chat',
            other: '# chats',
          })}
        />
      }
    >
      <StyledSelection>
        <AiChatInboxSelectionPile threads={selectedThreads} />
        <EmptyState.Content>
          <EmptyState.Title>
            {plural(selectedThreads.length, {
              one: '# chat selected',
              other: '# chats selected',
            })}
          </EmptyState.Title>
          <StyledButtons>
            <Button
              size="sm"
              variant="outline"
              shortcut={['Esc']}
              onClick={resetRecordSelection}
            >
              {t`Clear selection`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              shortcut={['Mod', 'K']}
              onClick={openSidePanelMenu}
            >
              {t`All actions`}
            </Button>
          </StyledButtons>
        </EmptyState.Content>
      </StyledSelection>
    </PageCardLayout>
  );
};
