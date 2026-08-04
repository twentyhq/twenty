import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconChevronDown, IconChevronUp, IconTool } from 'twenty-ui/icon';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
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
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 1px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.font.color.primary : 'transparent'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} 0;
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

  const toolName = isNonEmptyString(part.toolName)
    ? part.toolName
    : part.type.startsWith('tool-')
      ? part.type.slice('tool-'.length)
      : part.type;

  const hasToolError =
    part.state === 'output-error' || isNonEmptyString(part.errorMessage);

  const activeJsonValue = parseAdminToolJson(
    activeTab === 'output' ? part.toolOutput : part.toolInput,
  );

  return (
    <StyledContainer>
      <StyledToggleRow
        aria-expanded={isExpanded}
        onClick={() =>
          setIsExpanded((previousIsExpanded) => !previousIsExpanded)
        }
      >
        <StyledToolLabel>
          <IconTool size={14} />
          {toolName}
          {hasToolError && <Tag color="red" text={t`Failed`} />}
        </StyledToolLabel>
        <StyledRightContent>
          {isExpanded ? (
            <IconChevronUp size={14} />
          ) : (
            <IconChevronDown size={14} />
          )}
        </StyledRightContent>
      </StyledToggleRow>
      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        <StyledTabContainer>
          <StyledTab
            isActive={activeTab === 'output'}
            onClick={() => setActiveTab('output')}
          >
            {t`Output`}
          </StyledTab>
          <StyledTab
            isActive={activeTab === 'input'}
            onClick={() => setActiveTab('input')}
          >
            {t`Input`}
          </StyledTab>
        </StyledTabContainer>
        {isDefined(activeJsonValue) ? (
          <StyledJsonTreeContainer>
            <JsonTree
              value={activeJsonValue}
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
          <StyledEmptyTabLabel>
            {activeTab === 'output' ? t`No output` : t`No input`}
          </StyledEmptyTabLabel>
        )}
        {isNonEmptyString(part.errorMessage) && (
          <StyledErrorMessage>{part.errorMessage}</StyledErrorMessage>
        )}
      </AnimatedExpandableContainer>
    </StyledContainer>
  );
};
