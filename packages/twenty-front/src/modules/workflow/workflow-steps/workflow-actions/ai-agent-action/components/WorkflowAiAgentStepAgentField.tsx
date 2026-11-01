import { getAgentIcon } from '@/object-core/agents/utils/getAgentIcon';
import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

type WorkflowAiAgentStepAgentFieldProps = {
  agent: Pick<FlatAgent, 'id' | 'label' | 'icon'>;
};

export const WorkflowAiAgentStepAgentField = ({
  agent,
}: WorkflowAiAgentStepAgentFieldProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(getAgentIcon(agent.icon));

  return (
    <FormFieldInputContainer>
      <Field.Label>{t`Agent`}</Field.Label>
      <div>
        <LinkChip
          to={getCoreAgentLink(agent.id)}
          variant="soft"
          startElement={
            <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
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
