import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';

import { CoreAgentDataAccessSection } from '@/object-core/agents/components/CoreAgentDataAccessSection';
import { CoreAgentModelSection } from '@/object-core/agents/components/CoreAgentModelSection';
import { CoreAgentToolsSection } from '@/object-core/agents/components/CoreAgentToolsSection';
import { CoreAgentTriggersSection } from '@/object-core/agents/components/CoreAgentTriggersSection';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { TextArea } from '@/ui/input/components/TextArea';

type CoreAgentSettingsContentProps = {
  agent: CoreAgent;
  formValues: CoreAgentFormValues;
  onFieldChange: (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => void;
  isReadOnly: boolean;
  areTriggersEnabled: boolean;
};

export const CoreAgentSettingsContent = ({
  agent,
  formValues,
  onFieldChange,
  isReadOnly,
  areTriggersEnabled,
}: CoreAgentSettingsContentProps) => {
  const { t } = useLingui();

  return (
    <>
      {areTriggersEnabled && (
        <CoreAgentTriggersSection agent={agent} isReadOnly={isReadOnly} />
      )}
      <Section.Root>
        <Section.Header
          title={t`Instructions`}
          description={t`What should the agent do every time it runs?`}
        />
        <TextArea
          textAreaId="agent-prompt-textarea"
          placeholder={t`Write some instructions`}
          minRows={7}
          maxRows={20}
          value={formValues.prompt}
          onChange={(value) => onFieldChange('prompt', value)}
          disabled={isReadOnly}
        />
      </Section.Root>
      <CoreAgentDataAccessSection agent={agent} isReadOnly={isReadOnly} />
      <CoreAgentToolsSection agent={agent} isReadOnly={isReadOnly} />
      <CoreAgentModelSection
        formValues={formValues}
        onFieldChange={onFieldChange}
        isReadOnly={isReadOnly}
      />
      <Section.Root>
        <Section.Header
          title={t`Description`}
          description={t`Optional · A short summary of what this agent does`}
        />
        <TextArea
          textAreaId="agent-description-textarea"
          placeholder={t`Write a description`}
          minRows={1}
          maxRows={6}
          value={formValues.description ?? ''}
          onChange={(value) => onFieldChange('description', value)}
          disabled={isReadOnly}
        />
      </Section.Root>
    </>
  );
};
