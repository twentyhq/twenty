import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { camelToSnakeCase, isDefined } from 'twenty-shared/utils';
import { useFormContext } from 'react-hook-form';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';
import { SettingsMcpServerTextField } from '@/settings/mcp-servers/components/SettingsMcpServerTextField';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { type McpServer } from '~/generated-metadata/graphql';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

type SettingsMcpServerFormFieldsProps = {
  mcpServer?: Pick<McpServer, 'id'>;
};

export const SettingsMcpServerFormFields = ({
  mcpServer,
}: SettingsMcpServerFormFieldsProps) => {
  const { t } = useLingui();
  const { getFieldState, setValue } = useFormContext<McpServerFormValues>();

  const isNewMcpServer = !isDefined(mcpServer);

  const syncNameWithLabel = (label: string) => {
    if (getFieldState('name').isDirty) {
      return;
    }

    setValue('name', camelToSnakeCase(computeMetadataNameFromLabel(label)));
  };
  const instanceIdPrefix = mcpServer?.id ?? 'new-mcp-server';

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`About`}
          description={t`How this server is named for your team and for agents`}
        />
        <StyledInputsContainer>
          <SettingsMcpServerTextField
            name="label"
            instanceId={`${instanceIdPrefix}-label`}
            label={t`Label`}
            placeholder={t`Linear`}
            autoFocus={isNewMcpServer}
            onValueChange={isNewMcpServer ? syncNameWithLabel : undefined}
          />
          <SettingsMcpServerTextField
            name="name"
            instanceId={`${instanceIdPrefix}-name`}
            label={t`Name`}
            placeholder={t`linear`}
            hint={t`Prefix of the tool names agents see. Cannot be changed later.`}
            disabled={!isNewMcpServer}
          />
        </StyledInputsContainer>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Connection`}
          description={t`Where the server lives`}
        />
        <StyledInputsContainer>
          <SettingsMcpServerTextField
            name="url"
            instanceId={`${instanceIdPrefix}-url`}
            label={t`URL`}
            placeholder={t`https://mcp.example.com/mcp`}
          />
        </StyledInputsContainer>
      </Section.Root>
    </>
  );
};
