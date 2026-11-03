import { CoreAgentAvatar } from '@/object-core/agents/components/CoreAgentAvatar';
import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { useLingui } from '@lingui/react/macro';
import { Field } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

type WorkflowAiAgentStepAgentFieldProps = {
  agent: Pick<
    FlatAgent,
    'id' | 'label' | 'icon' | 'avatarColor' | 'avatarShape'
  >;
};

export const WorkflowAiAgentStepAgentField = ({
  agent,
}: WorkflowAiAgentStepAgentFieldProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <FormFieldInputContainer>
      <Field.Label>{t`Agent`}</Field.Label>
      <div>
        <LinkChip
          to={getCoreAgentLink(agent.id)}
          variant="soft"
          startElement={
            <CoreAgentAvatar agent={agent} size={theme.icon.size.sm} />
          }
        >
          {agent.label}
        </LinkChip>
      </div>
      <Field.Description>
        {t`The agent sets the instructions, model and permissions.`}
      </Field.Description>
    </FormFieldInputContainer>
  );
};
