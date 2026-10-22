import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import { IconChevronDown, IconChevronUp, IconTool } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { getAdminToolDisplayName } from '@/settings/admin-panel/utils/getAdminToolDisplayName';
import { parseAdminToolJson } from '@/settings/admin-panel/utils/parseAdminToolJson';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type SettingsAdminChatToolCallPartProps = {
  part: AdminChatThreadMessagePart;
};

const StyledContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledToggleRow = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: 0;
  width: 100%;
`;

const StyledToolLabel = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRightContent = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTabContainer = styled.div`
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledJsonTreeContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
  max-height: 300px;
  overflow: auto;
`;

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
`;

const StyledEmptyTabLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminChatToolCallPart = ({
  part,
}: SettingsAdminChatToolCallPartProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'input'>(
    isDefined(part.toolOutput) ? 'output' : 'input',
  );
  const { copyToClipboard } = useCopyToClipboard();

  const toolName = getAdminToolDisplayName(part);

  const hasToolError =
    part.state === 'output-error' || isNonEmptyString(part.errorMessage);

  const tabPanels = [
    {
      value: 'output',
      content: parseAdminToolJson(part.toolOutput),
      emptyLabel: t`No output`,
    },
    {
      value: 'input',
      content: parseAdminToolJson(part.toolInput),
      emptyLabel: t`No input`,
    },
  ];

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={<StyledContainer />}
    >
      <Collapsible.Trigger render={<StyledToggleRow />}>
        <StyledToolLabel>
          <IconTool size={14} />
          {toolName}
          {hasToolError && <Tag color="red">{t`Failed`}</Tag>}
        </StyledToolLabel>
        <StyledRightContent>
          {isExpanded ? (
            <IconChevronUp size={14} />
          ) : (
            <IconChevronDown size={14} />
          )}
        </StyledRightContent>
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => {
            if (value !== 'output' && value !== 'input') {
              return;
            }
            setActiveTab(value);
          }}
        >
          <Tabs.List
            aria-label={t`Tool call details`}
            render={<StyledTabContainer />}
          >
            <Tabs.Tab value="output" size="compact">
              {t`Output`}
            </Tabs.Tab>
            <Tabs.Tab value="input" size="compact">
              {t`Input`}
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
          {tabPanels.map(({ value, content, emptyLabel }) => (
            <Tabs.Panel key={value} value={value}>
              {isDefined(content) ? (
                <StyledJsonTreeContainer>
                  <JsonTree
                    value={content}
                    shouldExpandNodeInitially={() => false}
                    emptyArrayLabel={t`Empty Array`}
                    emptyObjectLabel={t`Empty Object`}
                    emptyStringLabel={t`[empty string]`}
                    arrowButtonCollapsedLabel={t`Expand`}
                    arrowButtonExpandedLabel={t`Collapse`}
                    onNodeValueClick={copyToClipboard}
                  />
                </StyledJsonTreeContainer>
              ) : (
                <StyledEmptyTabLabel>{emptyLabel}</StyledEmptyTabLabel>
              )}
            </Tabs.Panel>
          ))}
        </Tabs.Root>
        {isNonEmptyString(part.errorMessage) && (
          <StyledErrorMessage>{part.errorMessage}</StyledErrorMessage>
        )}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
