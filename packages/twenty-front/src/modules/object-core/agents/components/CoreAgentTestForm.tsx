import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconPlayerPlay } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useCoreAgentTestHint } from '@/object-core/agents/hooks/useCoreAgentTestHint';
import { useTestCoreAgent } from '@/object-core/agents/hooks/useTestCoreAgent';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { TextArea } from '@/ui/input/components/TextArea';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  outline: none;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

type CoreAgentTestFormProps = {
  agent: CoreAgent;
};

export const CoreAgentTestForm = ({ agent }: CoreAgentTestFormProps) => {
  const { t } = useLingui();
  const [message, setMessage] = useState('');
  const { testCoreAgent, isTestingCoreAgent } = useTestCoreAgent(agent);
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);
  const testHint = useCoreAgentTestHint(agent);

  const canTest = isNonEmptyString(message.trim()) && !isTestingCoreAgent;

  const handleTest = () => {
    if (!canTest) {
      return;
    }

    void testCoreAgent(message.trim());
  };

  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    focusId: currentFocusId ?? SIDE_PANEL_FOCUS_ID,
    callback: handleTest,
    dependencies: [currentFocusId, handleTest],
  });

  return (
    <StyledContainer ref={containerRef} tabIndex={-1}>
      <StyledContent>
        <TextArea
          textAreaId={`core-agent-test-message-${agent.id}`}
          label={t`Message`}
          placeholder={
            testHint?.placeholder ?? t`Summarize what changed on Acme this week`
          }
          description={testHint?.description}
          minRows={4}
          maxRows={12}
          value={message}
          onChange={setMessage}
        />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="test-agent"
            startIcon={<IconPlayerPlay />}
            size="sm"
            shortcut={['Mod', 'Enter']}
            disabled={!canTest}
            onClick={handleTest}
            variant="solid"
            color="accent"
          >{t`Run test`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
