// Design mockup for a configurable MCP connection, built only from existing components. Not wired to the server.
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Callout } from 'twenty-ui/components/feedback';
import { CodeEditor, CodeEditorHeader } from 'twenty-ui/components/code-editor';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconApps,
  IconEye,
  IconHierarchy,
  IconInfoCircle,
  IconKey,
  IconLayoutDashboard,
  IconLego,
  IconListSearch,
  IconLock,
  IconMail,
  IconSettingsAutomation,
  IconShield,
  IconSparkles,
  IconTable,
  IconTool,
  IconWebhook,
  IconCompass,
  IconAddressBook,
  IconLayoutGridAdd,
  IconAlertTriangle,
  type IconComponent,
} from 'twenty-ui/icon';
import { Badge } from 'twenty-ui/primitives/data-display';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { getSettingsAiTabs } from '@/settings/ai/utils/getSettingsAiTabs';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import McpCoverDark from '@/settings/mcp/assets/mcp-cover-dark.png';
import McpCoverLight from '@/settings/mcp/assets/mcp-cover-light.png';
import { SettingsMcpSetupCard } from '@/settings/mcp/components/SettingsMcpSetupCard';
import { buildMcpSetupCategories } from '@/settings/mcp/utils/buildMcpSetupCategories';
import { LightCopyIconButton } from '@/ui/input/components/LightCopyIconButton';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { Select } from '@/ui/input/components/Select';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const SERVER_URL = 'https://acme.twenty.com/mcp';

type ToolList = 'standard' | 'perObject' | 'minimal';
type Auth = 'oauth' | 'apiKey';
type Format = 'url' | 'json' | 'claudeCode' | 'codex';

type ToolCategory = {
  value: string;
  label: string;
  Icon: IconComponent;
  toolCount: number;
  readToolCount: number;
  sizeKb: number;
  examples: string;
};

// Counts from tools/list on the seeded workspace (admin), default mode
const TOOL_CATEGORIES: ToolCategory[] = [
  {
    value: 'records',
    label: 'Records',
    Icon: IconAddressBook,
    toolCount: 8,
    readToolCount: 2,
    sizeKb: 24,
    examples: 'find_records, upsert_records, merge_records',
  },
  {
    value: 'dataModel',
    label: 'Data model',
    Icon: IconHierarchy,
    toolCount: 17,
    readToolCount: 4,
    sizeKb: 38,
    examples: 'get_field_metadata, create_object_metadata',
  },
  {
    value: 'workflows',
    label: 'Workflows',
    Icon: IconSettingsAutomation,
    toolCount: 19,
    readToolCount: 7,
    sizeKb: 190,
    examples: 'create_complete_workflow, run_workflow_version',
  },
  {
    value: 'dashboards',
    label: 'Dashboards',
    Icon: IconLayoutDashboard,
    toolCount: 8,
    readToolCount: 3,
    sizeKb: 62,
    examples: 'create_complete_dashboard, add_page_layout_widget',
  },
  {
    value: 'views',
    label: 'Views',
    Icon: IconTable,
    toolCount: 22,
    readToolCount: 5,
    sizeKb: 41,
    examples: 'get_views, upsert_complete_view',
  },
  {
    value: 'email',
    label: 'Email and calendar',
    Icon: IconMail,
    toolCount: 11,
    readToolCount: 3,
    sizeKb: 27,
    examples: 'send_email, create_calendar_event',
  },
  {
    value: 'navigation',
    label: 'Navigation',
    Icon: IconCompass,
    toolCount: 4,
    readToolCount: 1,
    sizeKb: 7,
    examples: 'create_navigation_menu_item',
  },
  {
    value: 'webhooks',
    label: 'Webhooks',
    Icon: IconWebhook,
    toolCount: 4,
    readToolCount: 1,
    sizeKb: 6,
    examples: 'create_webhook, list_webhooks',
  },
  {
    value: 'roles',
    label: 'Roles',
    Icon: IconLock,
    toolCount: 7,
    readToolCount: 1,
    sizeKb: 21,
    examples: 'create_role, upsert_object_permissions',
  },
  {
    value: 'agents',
    label: 'Agents',
    Icon: IconLego,
    toolCount: 4,
    readToolCount: 1,
    sizeKb: 9,
    examples: 'create_agent, list_agents',
  },
  {
    value: 'frontComponents',
    label: 'Front components',
    Icon: IconLayoutGridAdd,
    toolCount: 1,
    readToolCount: 0,
    sizeKb: 3,
    examples: 'place_front_component',
  },
];

const ALWAYS_LISTED = { toolCount: 4, sizeKb: 7 };

type WorkspacePolicy = {
  blockedCategories: string[];
  isReadOnly: boolean;
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

const StyledEditorTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const buildUrl = ({
  toolList,
  categories,
  isReadOnly,
  hasAppFunctions,
}: {
  toolList: ToolList;
  categories: string[];
  isReadOnly: boolean;
  hasAppFunctions: boolean;
}) => {
  const params = new URLSearchParams();

  if (toolList === 'perObject') params.set('mode', 'direct');
  if (toolList === 'minimal') params.set('mode', 'meta');
  const excluded = TOOL_CATEGORIES.map((category) => category.value).filter(
    (value) => !categories.includes(value),
  );

  if (toolList !== 'minimal' && excluded.length > 0) {
    if (excluded.length <= categories.length) {
      params.set('exclude', excluded.join(','));
    } else {
      params.set('tools', categories.join(','));
    }
  }
  if (isReadOnly) params.set('readOnly', 'true');
  if (hasAppFunctions && toolList === 'standard') params.set('apps', 'true');

  const query = params.toString().replaceAll('%2C', ',');

  return query.length > 0 ? `${SERVER_URL}?${query}` : SERVER_URL;
};

const buildSnippet = ({
  format,
  url,
  auth,
}: {
  format: Format;
  url: string;
  auth: Auth;
}) => {
  const header = auth === 'apiKey' ? 'Bearer <YOUR_API_KEY>' : undefined;

  switch (format) {
    case 'url':
      return url;
    case 'json':
      return JSON.stringify(
        {
          mcpServers: {
            twenty: {
              url,
              ...(header && { headers: { Authorization: header } }),
            },
          },
        },
        null,
        2,
      );
    case 'claudeCode':
      return `claude mcp add --transport http twenty "${url}"${header ? ` \\\n  --header "Authorization: ${header}"` : ''}`;
    case 'codex':
      return `[mcp_servers.twenty]\nurl = "${url}"${header ? `\nbearer_token_env_var = "TWENTY_API_KEY"` : ''}`;
  }
};

const McpConnectionConfigurator = ({
  policy,
}: {
  policy?: WorkspacePolicy;
}) => {
  const blockedCategories = policy?.blockedCategories ?? [];
  const [toolList, setToolList] = useState<ToolList>('standard');
  const [categories, setCategories] = useState<string[]>(
    TOOL_CATEGORIES.map((category) => category.value).filter(
      (value) =>
        !['roles', 'webhooks', 'frontComponents'].includes(value) &&
        !blockedCategories.includes(value),
    ),
  );
  const [isReadOnly, setIsReadOnly] = useState(policy?.isReadOnly ?? false);
  const [hasAppFunctions, setHasAppFunctions] = useState(false);
  const [auth, setAuth] = useState<Auth>('oauth');
  const [format, setFormat] = useState<Format>('json');

  const selectedCategories = TOOL_CATEGORIES.filter((category) =>
    categories.includes(category.value),
  );
  const url = buildUrl({ toolList, categories, isReadOnly, hasAppFunctions });
  const snippet = buildSnippet({ format, url, auth });

  const listedCategories = toolList === 'minimal' ? [] : selectedCategories;
  const toolCount =
    toolList === 'minimal'
      ? 7
      : ALWAYS_LISTED.toolCount +
        listedCategories.reduce(
          (total, category) =>
            total +
            (isReadOnly ? category.readToolCount : category.toolCount) +
            (toolList === 'perObject' && category.value === 'records'
              ? 250
              : 0),
          0,
        );
  const sizeKb =
    toolList === 'minimal'
      ? 4
      : ALWAYS_LISTED.sizeKb +
        listedCategories.reduce(
          (total, category) =>
            total +
            Math.round(
              category.sizeKb *
                (isReadOnly
                  ? category.readToolCount / Math.max(category.toolCount, 1)
                  : 1),
            ) +
            (toolList === 'perObject' && category.value === 'records'
              ? 830
              : 0),
          0,
        );

  const toggleCategory = (value: string) =>
    setCategories((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );

  return (
    <>
      <Section.Root>
        <Section.Header
          title="Custom connection"
          description="Choose what your MCP client gets, then copy its URL or configuration."
        />
        <StyledStack>
          {blockedCategories.length > 0 && (
            <Callout
              status="info"
              icon={
                <IconInfoCircle
                  size={themeCssVariables.icon.size.md}
                  aria-hidden="true"
                />
              }
              fullWidth
              title="Some tools are off for this workspace"
              description="A workspace admin turned off Roles and Webhooks for every MCP client, ChatGPT included."
            />
          )}
          <StyledSettingsSelectGroup controlWidth={180}>
            <Card.Root>
              <SettingsOptionCardContentSelect
                Icon={IconTool}
                title="Tool list"
                description="Standard works in ChatGPT and every other client"
                divider
              >
                <Select<ToolList>
                  dropdownId="mockup-mcp-tool-list"
                  value={toolList}
                  onChange={setToolList}
                  selectSizeVariant="small"
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'perObject', label: 'One per object' },
                    { value: 'minimal', label: 'Minimal' },
                  ]}
                />
              </SettingsOptionCardContentSelect>
              <SettingsOptionCardContentSelect
                Icon={IconListSearch}
                title="Tool categories"
                description={
                  toolList === 'minimal'
                    ? 'Minimal reaches every tool through execute_tool'
                    : 'Leave out what your client never needs'
                }
                divider
              >
                <DropdownRoot
                  dropdownId="mockup-mcp-tool-categories"
                  type="picker"
                  multiple
                >
                  <Dropdown.Trigger
                    render={<div />}
                    nativeButton={false}
                    disabled={toolList === 'minimal'}
                    aria-label="Tool categories"
                  >
                    <MultiSelectControl
                      selectedOptions={selectedCategories}
                      fixedIcon={
                        selectedCategories.length > 1
                          ? IconListSearch
                          : undefined
                      }
                      fixedText={
                        toolList === 'minimal'
                          ? 'All, on demand'
                          : selectedCategories.length === 0
                            ? 'None'
                            : selectedCategories.length > 1
                              ? `${selectedCategories.length} categories`
                              : undefined
                      }
                      isDisabled={toolList === 'minimal'}
                      hasRightElement={false}
                    />
                  </Dropdown.Trigger>
                  <DropdownContent side="bottom" align="end" sideOffset={8}>
                    <Dropdown.Section>
                      {TOOL_CATEGORIES.filter(
                        (category) =>
                          !blockedCategories.includes(category.value),
                      ).map((category) => (
                        <Dropdown.OptionItem
                          key={category.value}
                          selected={categories.includes(category.value)}
                          onSelect={() => toggleCategory(category.value)}
                          startIcon={<SelectOptionIcon Icon={category.Icon} />}
                        >
                          {category.label}
                        </Dropdown.OptionItem>
                      ))}
                      {TOOL_CATEGORIES.filter((category) =>
                        blockedCategories.includes(category.value),
                      ).map((category) => (
                        <Dropdown.OptionItem
                          key={category.value}
                          disabled
                          description="Off for this workspace"
                          startIcon={<SelectOptionIcon Icon={category.Icon} />}
                        >
                          {category.label}
                        </Dropdown.OptionItem>
                      ))}
                    </Dropdown.Section>
                  </DropdownContent>
                </DropdownRoot>
              </SettingsOptionCardContentSelect>
              <SettingsOptionCardContentSwitch
                Icon={IconEye}
                title="Read only"
                description={
                  policy?.isReadOnly
                    ? 'Required by your workspace admin'
                    : 'List only the tools that read data'
                }
                checked={isReadOnly}
                disabled={policy?.isReadOnly}
                onChange={setIsReadOnly}
                divider
              />
              <SettingsOptionCardContentSwitch
                Icon={IconApps}
                title="App functions"
                description="Functions of installed apps. Their names differ per workspace"
                checked={toolList === 'perObject' || hasAppFunctions}
                disabled={toolList !== 'standard'}
                onChange={setHasAppFunctions}
                divider
              />
              <SettingsOptionCardContentSelect
                Icon={IconKey}
                title="Sign in with"
                description="OAuth signs in as you; an API key uses its role"
              >
                <Select<Auth>
                  dropdownId="mockup-mcp-auth"
                  value={auth}
                  onChange={setAuth}
                  selectSizeVariant="small"
                  options={[
                    { value: 'oauth', label: 'OAuth' },
                    { value: 'apiKey', label: 'API key' },
                  ]}
                />
              </SettingsOptionCardContentSelect>
            </Card.Root>
          </StyledSettingsSelectGroup>
        </StyledStack>
      </Section.Root>

      <Section.Root>
        <Section.Header
          title="Preview"
          description={`${toolCount} tools · about ${sizeKb >= 1000 ? `${(sizeKb / 1000).toFixed(1)} MB` : `${sizeKb} KB`} of definitions`}
        />
        <StyledStack>
          {sizeKb > 300 && (
            <Callout
              status="warning"
              icon={
                <IconAlertTriangle
                  size={themeCssVariables.icon.size.md}
                  aria-hidden="true"
                />
              }
              fullWidth
              title="Large tool list"
              description="Clients that load every tool up front can run out of context. Claude, ChatGPT and Codex load tools on demand."
            />
          )}
          <Card.Root>
            {toolList === 'minimal' ? (
              <SettingsListItemCardContent
                LeftIcon={IconSparkles}
                label="Meta-tools"
                description="get_tool_catalog, learn_tools, execute_tool"
                rightComponent={<Badge>7</Badge>}
              />
            ) : (
              listedCategories.map((category, index) => (
                <SettingsListItemCardContent
                  key={category.value}
                  LeftIcon={category.Icon}
                  label={category.label}
                  description={
                    toolList === 'perObject' && category.value === 'records'
                      ? 'find_many_companies, create_one_person and 248 more'
                      : category.examples
                  }
                  divider={
                    index < listedCategories.length - 1 || hasAppFunctions
                  }
                  rightComponent={
                    <Badge>
                      {(isReadOnly
                        ? category.readToolCount
                        : category.toolCount) +
                        (toolList === 'perObject' &&
                        category.value === 'records'
                          ? 250
                          : 0)}
                    </Badge>
                  }
                />
              ))
            )}
            {toolList === 'standard' && hasAppFunctions && (
              <SettingsListItemCardContent
                LeftIcon={IconApps}
                label="App functions"
                description="Depends on the apps installed in each workspace"
                rightComponent={<StyledMuted>Varies</StyledMuted>}
              />
            )}
          </Card.Root>
          <SegmentedControl<Format>
            aria-label="Configuration format"
            value={format}
            onValueChange={(value) => setFormat(value)}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'url', label: 'URL' },
              { value: 'claudeCode', label: 'Claude Code' },
              { value: 'codex', label: 'Codex' },
            ]}
          />
          <div>
            <CodeEditorHeader
              startElement={
                <StyledEditorTitle>
                  <IconSparkles size={themeCssVariables.icon.size.md} />
                  <span>MCP client configuration</span>
                </StyledEditorTitle>
              }
              endElement={<LightCopyIconButton copyText={snippet} />}
            />
            <CodeEditor
              value={snippet}
              language={format === 'json' ? 'json' : 'shell'}
              variant="with-header"
              contentPadding="comfortable"
              autoHeight
              options={{
                readOnly: true,
                domReadOnly: true,
                lineNumbers: 'off',
                lineNumbersMinChars: 0,
                folding: false,
                glyphMargin: false,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'none',
                wordWrap: 'on',
              }}
            />
          </div>
        </StyledStack>
      </Section.Root>
    </>
  );
};

const WorkspaceMcpPolicySection = () => {
  const [isCustomizationAllowed, setIsCustomizationAllowed] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [blockedCategories, setBlockedCategories] = useState([
    'roles',
    'webhooks',
  ]);
  const [roleCap, setRoleCap] = useState('none');

  const blocked = TOOL_CATEGORIES.filter((category) =>
    blockedCategories.includes(category.value),
  );

  return (
    <Section.Root>
      <Section.Header
        title="Workspace policy"
        description="Applies to every MCP client in this workspace, ChatGPT included. Members can't change it."
      />
      <StyledSettingsSelectGroup controlWidth={180}>
        <Card.Root>
          <SettingsOptionCardContentSelect
            Icon={IconShield}
            title="Role cap"
            description="MCP clients never get more than this role, whatever the member's own role"
            divider
          >
            <Select
              dropdownId="mockup-mcp-role-cap"
              value={roleCap}
              onChange={setRoleCap}
              selectSizeVariant="small"
              options={[
                { value: 'none', label: 'No cap' },
                { value: 'member', label: 'Member' },
                { value: 'sales', label: 'Sales' },
                { value: 'readOnly', label: 'Read only' },
              ]}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSelect
            Icon={IconListSearch}
            title="Turned off tools"
            description="Never listed or callable over MCP"
            divider
          >
            <DropdownRoot
              dropdownId="mockup-mcp-blocked-categories"
              type="picker"
              multiple
            >
              <Dropdown.Trigger
                render={<div />}
                nativeButton={false}
                aria-label="Turned off tools"
              >
                <MultiSelectControl
                  selectedOptions={blocked}
                  fixedIcon={blocked.length > 1 ? IconListSearch : undefined}
                  fixedText={
                    blocked.length === 0
                      ? 'None'
                      : blocked.length > 1
                        ? `${blocked.length} categories`
                        : undefined
                  }
                  hasRightElement={false}
                />
              </Dropdown.Trigger>
              <DropdownContent side="bottom" align="end" sideOffset={8}>
                <Dropdown.Section>
                  {TOOL_CATEGORIES.map((category) => (
                    <Dropdown.OptionItem
                      key={category.value}
                      selected={blockedCategories.includes(category.value)}
                      onSelect={() =>
                        setBlockedCategories((previous) =>
                          previous.includes(category.value)
                            ? previous.filter((item) => item !== category.value)
                            : [...previous, category.value],
                        )
                      }
                      startIcon={<SelectOptionIcon Icon={category.Icon} />}
                    >
                      {category.label}
                    </Dropdown.OptionItem>
                  ))}
                </Dropdown.Section>
              </DropdownContent>
            </DropdownRoot>
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSwitch
            Icon={IconEye}
            title="Read only"
            description="MCP clients can read data but not change it"
            checked={isReadOnly}
            onChange={setIsReadOnly}
            divider
          />
          <SettingsOptionCardContentSwitch
            Icon={IconTool}
            title="Custom connections"
            description="Let members trim their own tool list with a custom URL"
            checked={isCustomizationAllowed}
            onChange={setIsCustomizationAllowed}
          />
        </Card.Root>
      </StyledSettingsSelectGroup>
    </Section.Root>
  );
};

const McpTabLayout = ({ children }: { children: React.ReactNode }) => {
  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
  );

  useEffect(() => {
    setActiveTabId(SETTINGS_AI_TABS.TABS_IDS.MCP);
  }, [setActiveTabId]);

  return (
    <SettingsPageLayout
      title="AI"
      secondaryBar={
        <SettingsTabBar
          aria-label="AI settings"
          tabs={getSettingsAiTabs(false)}
          componentInstanceId={SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID}
        />
      }
      links={[
        { children: 'Workspace', href: '/settings/general' },
        { children: 'AI' },
      ]}
    >
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};

const getCategories = () =>
  buildMcpSetupCategories({
    isHttpsInstallLinkEnabled: true,
    mcpServerUrl: SERVER_URL,
    workspaceName: 'Acme',
  });

const QuickInstallAndOtherClients = () => {
  const [quickInstall, otherClients] = getCategories();

  return (
    <>
      <Section.Root>
        <SettingsDiscoveryHeroCard
          lightSrc={McpCoverLight}
          darkSrc={McpCoverDark}
          instanceIdPrefix="mockup-mcp-hero"
          tabs={[]}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={quickInstall.title}
          description={quickInstall.description}
        />
        <StyledCardsGrid>
          {quickInstall.cards.map((card) => (
            <SettingsMcpSetupCard key={card.title} card={card} />
          ))}
        </StyledCardsGrid>
        <Card.Root>
          <SettingsListItemCardContent
            LeftIcon={IconApps}
            label="Other clients"
            description={`Cursor, VS Code, Goose and ${otherClients.cards.length - 3} more`}
            to="/settings/ai/mcp-clients"
            rightComponent={null}
          />
        </Card.Root>
      </Section.Root>
    </>
  );
};

const McpTabMockupPage = () => (
  <McpTabLayout>
    <QuickInstallAndOtherClients />
    <McpConnectionConfigurator />
  </McpTabLayout>
);

const McpTabWithPolicyMockupPage = () => (
  <McpTabLayout>
    <QuickInstallAndOtherClients />
    <McpConnectionConfigurator
      policy={{ blockedCategories: ['roles', 'webhooks'], isReadOnly: false }}
    />
  </McpTabLayout>
);

const McpTabAdminMockupPage = () => (
  <McpTabLayout>
    <QuickInstallAndOtherClients />
    <McpConnectionConfigurator
      policy={{ blockedCategories: ['roles', 'webhooks'], isReadOnly: false }}
    />
    <WorkspaceMcpPolicySection />
  </McpTabLayout>
);

const OtherClientsMockupPage = () => {
  const [, otherClients] = getCategories();

  return (
    <SettingsPageLayout
      title="Other clients"
      links={[
        { children: 'Workspace', href: '/settings/general' },
        { children: 'AI', href: '/settings/ai#mcp' },
        { children: 'Other clients' },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title="Install links and guides"
            description={otherClients.description}
          />
          <StyledCardsGrid>
            {otherClients.cards.map((card) => (
              <SettingsMcpSetupCard key={card.title} card={card} />
            ))}
          </StyledCardsGrid>
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Mockups/Settings/AI/McpConnection',
  component: McpTabMockupPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/ai' },
  parameters: { msw: { handlers: graphqlMocks.handlers } },
};

export default meta;

type Story = StoryObj<typeof McpTabMockupPage>;

export const McpTab: Story = {};

export const McpTabWithWorkspacePolicy: Story = {
  render: () => <McpTabWithPolicyMockupPage />,
};

export const McpTabAdmin: Story = {
  render: () => <McpTabAdminMockupPage />,
};

export const OtherClients: Story = {
  render: () => <OtherClientsMockupPage />,
};
