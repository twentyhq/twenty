import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconChevronDown, IconRepeat, IconX, useIcons } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxPlanToolCallEditor } from '@/inbox/components/InboxPlanToolCallEditor';
import { type InboxItemContextSource } from '@/inbox/types/InboxItemContext';
import {
  type InboxItemToolCall,
  InboxItemToolCallStatus,
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
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  opacity: ${({ isRejected }) => (isRejected ? 0.5 : 1)};
  padding: ${themeCssVariables.spacing[1]} 0;
  text-align: left;
  text-decoration: ${({ isRejected }) =>
    isRejected ? 'line-through' : 'none'};
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
  onToggleExpanded: () => void;
  onSave: (editedInput: Record<string, unknown>) => Promise<void>;
  onToggleRejected: (isRejected: boolean) => Promise<void>;
};

export const InboxPlanToolCallRow = ({
  toolCall,
  source,
  isExpanded,
  onToggleExpanded,
  onSave,
  onToggleRejected,
}: InboxPlanToolCallRowProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const ToolIcon = getIcon(toolCall.icon);
  const isRejected = toolCall.status === InboxItemToolCallStatus.REJECTED;
  const hasRun =
    toolCall.status === InboxItemToolCallStatus.EXECUTED ||
    toolCall.status === InboxItemToolCallStatus.FAILED;

  return (
    <StyledRow>
      <StyledHeader>
        <StyledToggle
          type="button"
          aria-expanded={isExpanded}
          isRejected={isRejected}
          onClick={onToggleExpanded}
        >
          <ToolIcon size={theme.icon.size.md} />
          {toolCall.label}
        </StyledToggle>
        <StyledChevron isExpanded={isExpanded}>
          <LightIconButton
            Icon={IconChevronDown}
            accent="secondary"
            aria-label={isExpanded ? t`Collapse` : t`Expand`}
            onClick={onToggleExpanded}
          />
        </StyledChevron>
        {!hasRun && (
          <LightIconButton
            Icon={isRejected ? IconRepeat : IconX}
            accent="secondary"
            aria-label={isRejected ? t`Keep this step` : t`Skip this step`}
            title={isRejected ? t`Keep this step` : t`Skip this step`}
            onClick={() => void onToggleRejected(!isRejected)}
          />
        )}
      </StyledHeader>
      {isExpanded && (
        <InboxPlanToolCallEditor
          // Remounted per state so the draft always belongs to the row shown.
          key={`${toolCall.id}-${toolCall.status}`}
          toolCall={toolCall}
          source={source}
          onSave={onSave}
        />
      )}
    </StyledRow>
  );
};
