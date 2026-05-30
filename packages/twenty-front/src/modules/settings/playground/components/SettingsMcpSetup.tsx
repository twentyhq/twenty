import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  H2Title,
  IconCheck,
  IconCopy,
  IconDownload,
  IconSparkles,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// MCP / "Use Twenty with your AI assistant" surface.
// Follows the same flat layout as SettingsWorkspaceMembersTeamTab: one
// Section + one H2Title at the top, then content. Sub-areas use a lighter
// label style rather than stacking more H2Titles, which would read like a
// page-within-a-tab.

const StyledTabBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

const StyledSubLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[2]};
  text-transform: uppercase;
`;

const StyledCodeBlock = styled.pre`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[4]};
  white-space: pre;
`;

const StyledCodeWrapper = styled.div`
  position: relative;
`;

const StyledCopyButtonContainer = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
`;

const StyledClientGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`;

const StyledClientCard = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledCapabilityList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledCapabilityItem = styled.li`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRecipeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRecipeRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledRecipeText = styled.span`
  flex: 1;
`;

const buildMcpConfig = (serverUrl: string) =>
  `{
  "mcpServers": {
    "twenty": {
      "url": "${serverUrl}/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}`;

const useCopy = (value: string) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, handle };
};

const SUPPORTED_CLIENTS = [
  'Claude Desktop',
  'Cursor',
  'Cline',
  'Continue',
  'Zed',
  'Windsurf',
];

export const SettingsMcpSetup = () => {
  const { t } = useLingui();
  const mcpConfig = buildMcpConfig(REACT_APP_SERVER_BASE_URL);
  const configCopy = useCopy(mcpConfig);
  const schemaCopy = useCopy(
    // Placeholder — wire to the backend Markdown schema export when ready.
    '# Twenty workspace data model\n\n(Coming soon — schema export endpoint not yet wired.)',
  );

  const recipes = [
    t`Triage open Opportunities by stage and value, then draft follow-up emails to the owners.`,
    t`Find Companies with no Notes in the last 30 days and create a task to reach out.`,
    t`Summarize this week's Workflow runs and flag any that failed twice in a row.`,
    t`Generate test data for the Pets object — 20 records with realistic field values.`,
  ];

  return (
    <Section>
      <H2Title
        title={t`Connect your AI assistant`}
        description={t`Add Twenty as a Model Context Protocol (MCP) server. Your assistant gets access to the workspace — search, create, update — through a standard tool interface.`}
      />
      <StyledTabBody>
        <StyledCodeWrapper>
          <StyledCodeBlock>{mcpConfig}</StyledCodeBlock>
          <StyledCopyButtonContainer>
            <Button
              title={configCopy.copied ? t`Copied` : t`Copy`}
              Icon={configCopy.copied ? IconCheck : IconCopy}
              size="small"
              variant="secondary"
              onClick={configCopy.handle}
            />
          </StyledCopyButtonContainer>
        </StyledCodeWrapper>

        <div>
          <StyledSubLabel>{t`Tested with`}</StyledSubLabel>
          <StyledClientGrid>
            {SUPPORTED_CLIENTS.map((client) => (
              <StyledClientCard key={client}>
                <IconSparkles size={16} />
                {client}
              </StyledClientCard>
            ))}
          </StyledClientGrid>
        </div>

        <div>
          <StyledSubLabel>{t`What your assistant can do`}</StyledSubLabel>
          <StyledCapabilityList>
            <StyledCapabilityItem>
              <IconCheck size={16} /> {t`Search records across any object`}
            </StyledCapabilityItem>
            <StyledCapabilityItem>
              <IconCheck size={16} /> {t`Create and update records`}
            </StyledCapabilityItem>
            <StyledCapabilityItem>
              <IconCheck size={16} /> {t`Follow relations between records`}
            </StyledCapabilityItem>
            <StyledCapabilityItem>
              <IconCheck size={16} /> {t`Run saved views and pinned commands`}
            </StyledCapabilityItem>
            <StyledCapabilityItem>
              <IconCheck size={16} /> {t`Read the workspace's data model`}
            </StyledCapabilityItem>
          </StyledCapabilityList>
        </div>

        <div>
          <StyledSubLabel>{t`Inject your schema`}</StyledSubLabel>
          <Button
            title={schemaCopy.copied ? t`Copied` : t`Copy data model as Markdown`}
            Icon={schemaCopy.copied ? IconCheck : IconDownload}
            size="small"
            variant="secondary"
            onClick={schemaCopy.handle}
          />
        </div>

        <div>
          <StyledSubLabel>{t`Quick recipes`}</StyledSubLabel>
          <StyledRecipeList>
            {recipes.map((recipe) => (
              <RecipeRow key={recipe} text={recipe} />
            ))}
          </StyledRecipeList>
        </div>
      </StyledTabBody>
    </Section>
  );
};

const RecipeRow = ({ text }: { text: string }) => {
  const { t } = useLingui();
  const copy = useCopy(text);
  return (
    <StyledRecipeRow>
      <StyledRecipeText>{text}</StyledRecipeText>
      <Button
        title={copy.copied ? t`Copied` : t`Copy`}
        Icon={copy.copied ? IconCheck : IconCopy}
        size="small"
        variant="secondary"
        onClick={copy.handle}
      />
    </StyledRecipeRow>
  );
};
