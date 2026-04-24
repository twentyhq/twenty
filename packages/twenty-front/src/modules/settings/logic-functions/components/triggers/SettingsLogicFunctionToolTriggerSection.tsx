import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsToolParameterTable } from '~/pages/settings/ai/components/SettingsToolParameterTable';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

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
  const { theme } = useContext(ThemeContext);

  if (readonly && !isTool) {
    return null;
  }

  const schema = (toolInputSchema as ToolInputSchema | undefined) ?? {};
  const schemaProperties = isDefined(schema.properties)
    ? (schema.properties as Record<
        string,
        { type?: string; description?: string; format?: string }
      >)
    : {};

  return (
    <Section>
      <StyledHeader>
        <H2Title
          title={t`AI tool`}
          description={t`Triggers the function when called by an AI agent or workflow`}
        />
        {!readonly && (
          <Toggle
            value={isTool}
            onChange={onChange}
            toggleSize="small"
            color={theme.color.blue}
          />
        )}
      </StyledHeader>
      {isTool && (
        <SettingsToolParameterTable
          schemaProperties={schemaProperties}
          requiredFields={schema.required}
        />
      )}
    </Section>
  );
};
