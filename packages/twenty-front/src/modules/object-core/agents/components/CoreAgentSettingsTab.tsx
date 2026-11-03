import { CoreAgentIdentifierBar } from '@/object-core/agents/components/CoreAgentIdentifierBar';
import { CoreAgentSettingsContent } from '@/object-core/agents/components/CoreAgentSettingsContent';
import { CoreAgentDeleteConfirmationModal } from '@/object-core/agents/components/CoreAgentDeleteConfirmationModal';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';

const DELETE_AGENT_MODAL_ID = 'delete-agent-modal';

type CoreAgentSettingsTabProps = { disabled: boolean; agent: CoreAgent };

export const CoreAgentSettingsTab = ({
  disabled,
  agent,
}: CoreAgentSettingsTabProps) => {
  const { openDialog } = useDialog();
  return (
    <>
      <CoreAgentIdentifierBar agent={agent} />
      <CoreAgentSettingsContent agentId={agent.id} />
      {!disabled && (
        <Section.Root>
          <Section.Header title={t`Danger zone`} />
          <Button
            variant="outline"
            color="danger"
            onClick={() => openDialog(DELETE_AGENT_MODAL_ID)}
          >{t`Delete agent`}</Button>
          <CoreAgentDeleteConfirmationModal
            agentId={agent.id}
            agentName={agent.label}
          />
        </Section.Root>
      )}
    </>
  );
};
