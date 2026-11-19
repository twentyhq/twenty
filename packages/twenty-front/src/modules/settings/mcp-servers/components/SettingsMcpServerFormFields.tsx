import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsMcpServerLabelField } from '@/settings/mcp-servers/components/SettingsMcpServerLabelField';
import { SettingsMcpServerTextField } from '@/settings/mcp-servers/components/SettingsMcpServerTextField';
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

  const isNewMcpServer = !isDefined(mcpServer);
  const instanceIdPrefix = mcpServer?.id ?? 'new-mcp-server';

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`About`}
          description={t`How this server is named for your team and for agents`}
        />
        <StyledInputsContainer>
          <SettingsMcpServerLabelField
            instanceId={`${instanceIdPrefix}-label`}
            isNameSyncedWithLabel={isNewMcpServer}
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
