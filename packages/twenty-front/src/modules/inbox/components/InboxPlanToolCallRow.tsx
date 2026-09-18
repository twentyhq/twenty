import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconPlayerPlay,
  IconRepeat,
  IconX,
  useIcons,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { LightIconButton } from 'twenty-ui/components';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxPlanToolCallEditor } from '@/inbox/components/InboxPlanToolCallEditor';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';
import {
  type InboxItemToolCall,
  InboxItemToolCallStatus,
  type InboxItemContextSource,
} from '~/generated/graphql';

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledToggle = styled.button<{ isRejected: boolean }>`
  align-items: flex-start;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  opacity: ${({ isRejected }) => (isRejected ? 0.5 : 1)};
  padding: ${themeCssVariables.spacing[1]} 0;
  text-align: left;
`;

const StyledToggleIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 20px;
`;

const StyledToggleText = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledLabel = styled.span<{ isRejected: boolean }>`
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 20px;
  text-decoration: ${({ isRejected }) =>
    isRejected ? 'line-through' : 'none'};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  padding-left: ${themeCssVariables.spacing[6]};
`;

const StyledChevron = styled.span<{ isExpanded: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  transform: rotate(${({ isExpanded }) => (isExpanded ? 180 : 0)}deg);
  transition: transform 100ms ease;
`;

type InboxPlanToolCallRowProps = {
  toolCall: InboxItemToolCall;
  source?: InboxItemContextSource;
  isExpanded: boolean;
  // Blocks the per-step run while a run or a save is still on the wire.
  isBusy?: boolean;
  onToggleExpanded: () => void;
  onSave: (editedInput: Record<string, unknown>) => Promise<boolean>;
  onToggleRejected: (isRejected: boolean) => Promise<boolean>;
  // Runs this step alone and leaves the rest of the plan proposed.
  onRun?: () => Promise<void>;
  onRegisterFlush?: (flush: (() => Promise<boolean>) | null) => void;
};

export const InboxPlanToolCallRow = ({
  toolCall,
  source,
  isExpanded,
  isBusy = false,
  onToggleExpanded,
  onSave,
  onToggleRejected,
  onRun,
  onRegisterFlush,
}: InboxPlanToolCallRowProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const ToolIcon = getIcon(toolCall.icon);
  const isRejected = toolCall.status === InboxItemToolCallStatus.REJECTED;
  const isFailed = toolCall.status === InboxItemToolCallStatus.FAILED;
  const hasSucceeded = toolCall.status === InboxItemToolCallStatus.EXECUTED;
  const canRun =
    isDefined(onRun) &&
    (toolCall.status === InboxItemToolCallStatus.PROPOSED || isFailed);

  const statusTag = isFailed
    ? { color: 'red' as const, label: t`Failed` }
    : hasSucceeded
      ? { color: 'green' as const, label: t`Done` }
      : isRejected
        ? { color: 'gray' as const, label: t`Skipped` }
        : null;

  // The tool decides how its call is edited; the schema form is what a tool
  // gets when it has not said.
  const Editor =
    getInboxToolCallRenderer(toolCall.toolName)?.Editor ??
    InboxPlanToolCallEditor;

  return (
    <StyledRow>
      <StyledHeader>
        <StyledToggle
          type="button"
          aria-expanded={isExpanded}
          isRejected={isRejected}
          onClick={onToggleExpanded}
        >
          <StyledToggleIcon>
            <ToolIcon size={theme.icon.size.md} />
          </StyledToggleIcon>
          <StyledToggleText>
            <StyledLabel isRejected={isRejected}>{toolCall.label}</StyledLabel>
            {isNonEmptyString(toolCall.description) && (
              <StyledDescription>{toolCall.description}</StyledDescription>
            )}
          </StyledToggleText>
        </StyledToggle>
        {isDefined(statusTag) && (
          <Tag color={statusTag.color}>{statusTag.label}</Tag>
        )}
        <StyledChevron isExpanded={isExpanded}>
          <LightIconButton
            emphasis="standard"
            aria-label={isExpanded ? t`Collapse` : t`Expand`}
            onClick={onToggleExpanded}
          >
            <IconChevronDown />
          </LightIconButton>
        </StyledChevron>
        {canRun && (
          <LightIconButton
            emphasis="standard"
            aria-label={isFailed ? t`Try this step again` : t`Do this step`}
            title={isFailed ? t`Try this step again` : t`Do this step`}
            disabled={isBusy}
            onClick={() => void onRun()}
          >
            <IconPlayerPlay />
          </LightIconButton>
        )}
        {!hasSucceeded && (
          <LightIconButton
            emphasis="standard"
            aria-label={isRejected ? t`Keep this step` : t`Skip this step`}
            title={isRejected ? t`Keep this step` : t`Skip this step`}
            onClick={() => void onToggleRejected(!isRejected)}
          >
            {isRejected ? <IconRepeat /> : <IconX />}
          </LightIconButton>
        )}
      </StyledHeader>
      {isFailed && !isExpanded && (
        <StyledError>{toolCall.error ?? t`This step failed`}</StyledError>
      )}
      {isExpanded && (
        <Editor
          // Remounted per state so the draft always belongs to the row shown.
          key={`${toolCall.id}-${toolCall.status}`}
          toolCall={toolCall}
          source={source}
          onSave={onSave}
          onRegisterFlush={onRegisterFlush}
        />
      )}
    </StyledRow>
  );
};
