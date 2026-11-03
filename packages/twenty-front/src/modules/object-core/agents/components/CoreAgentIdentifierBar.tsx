import { CoreAgentAvatarPicker } from '@/object-core/agents/components/CoreAgentAvatarPicker';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useUpdateCoreAgentIdentity } from '@/object-core/agents/hooks/useUpdateCoreAgentIdentity';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { CoreObjectIdentifierBar } from '@/object-core/components/CoreObjectIdentifierBar';
import { t } from '@lingui/core/macro';
import { useTheme } from 'twenty-ui/theme';

type CoreAgentIdentifierBarProps = { agent: CoreAgent };

export const CoreAgentIdentifierBar = ({
  agent,
}: CoreAgentIdentifierBarProps) => {
  const theme = useTheme();
  const { isEditable } = useCoreAgentEditStatus({ agentId: agent.id });
  const { updateCoreAgentIdentity, isSavingIdentity } =
    useUpdateCoreAgentIdentity({ agentId: agent.id });

  return (
    <CoreObjectIdentifierBar
      recordId={agent.id}
      name={agent.label}
      namePlaceholder={t`Untitled agent`}
      isReadOnly={!isEditable || isSavingIdentity}
      onRename={(label) => updateCoreAgentIdentity({ label: label.trim() })}
      createdAt={agent.createdAt}
      icon={
        <CoreAgentAvatarPicker
          agent={agent}
          disabled={!isEditable}
          size={theme.icon.size.lg}
        />
      }
    />
  );
};
