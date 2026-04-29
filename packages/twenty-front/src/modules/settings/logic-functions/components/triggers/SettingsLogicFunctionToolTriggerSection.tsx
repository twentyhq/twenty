import { SettingsLogicFunctionTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerSection';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { SettingsToolParameterTable } from '~/pages/settings/ai/components/SettingsToolParameterTable';

type ToolInputSchema = {
  properties?: Record<string, unknown>;
  required?: string[];
};

type SettingsLogicFunctionToolTriggerSectionProps = {
  isTool: boolean;
  toolInputSchema?: object;
  onChange: (value: boolean) => void;
  readonly: boolean;
};

export const SettingsLogicFunctionToolTriggerSection = ({
  isTool,
  toolInputSchema,
  onChange,
  readonly,
}: SettingsLogicFunctionToolTriggerSectionProps) => {
  const { t } = useLingui();

  const schema = (toolInputSchema as ToolInputSchema | undefined) ?? {};
  const schemaProperties = isDefined(schema.properties)
    ? (schema.properties as Record<
        string,
        { type?: string; description?: string; format?: string }
      >)
    : {};

  return (
    <SettingsLogicFunctionTriggerSection
      title={t`AI tool`}
      description={t`Triggers the function when called by an AI agent or workflow`}
      enabled={isTool}
      onEnabledChange={onChange}
      readonly={readonly}
    >
      <SettingsToolParameterTable
        schemaProperties={schemaProperties}
        requiredFields={schema.required}
      />
    </SettingsLogicFunctionTriggerSection>
  );
};
