import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AI_CHAT_ASSISTANT_AVATAR_COLORS,
  AI_CHAT_ASSISTANT_AVATAR_SHAPES,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  AssistantAvatar,
  type AssistantAvatarSize,
} from 'twenty-ui/components/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

import { AI_CHAT_ASSISTANT_AVATAR_SHAPE_LABELS } from '@/ai/constants/AiChatAssistantAvatarShapeLabels';
import { useUpdateCoreAgentAvatar } from '@/object-core/agents/hooks/useUpdateCoreAgentAvatar';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentAvatar } from '@/object-core/agents/utils/getCoreAgentAvatar';
import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const StyledAvatarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 0;
`;

const StyledPopupContent = styled.div`
  display: contents;
`;

type CoreAgentAvatarPickerProps = {
  agent: CoreAgent;
  isReadOnly: boolean;
  size: AssistantAvatarSize;
};

export const CoreAgentAvatarPicker = ({
  agent,
  isReadOnly,
  size,
}: CoreAgentAvatarPickerProps) => {
  const { t } = useLingui();
  const colorLabels = useColorLabels();
  const { updateCoreAgentAvatar } = useUpdateCoreAgentAvatar(agent);

  const { color, shape } = getCoreAgentAvatar({
    agentId: agent.id,
    avatarColor: agent.avatarColor,
    avatarShape: agent.avatarShape,
  });
  const dropdownId = `core-agent-avatar-picker-${agent.id}`;

  if (isReadOnly) {
    return <AssistantAvatar color={color} shape={shape} size={size} />;
  }

  const handleShapeChange = (value: string | null) => {
    const avatarShape = AI_CHAT_ASSISTANT_AVATAR_SHAPES.find(
      (agentAvatarShape) => agentAvatarShape === value,
    );

    if (!isDefined(avatarShape)) {
      return;
    }

    updateCoreAgentAvatar({ avatarColor: agent.avatarColor, avatarShape });
  };

  const handleColorChange = (value: string | null) => {
    const avatarColor = AI_CHAT_ASSISTANT_AVATAR_COLORS.find(
      (agentAvatarColor) => agentAvatarColor === value,
    );

    if (!isDefined(avatarColor)) {
      return;
    }

    updateCoreAgentAvatar({ avatarColor, avatarShape: agent.avatarShape });
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger
        render={
          <StyledAvatarButton type="button" aria-label={t`Change avatar`}>
            <AssistantAvatar color={color} shape={shape} size={size} />
          </StyledAvatarButton>
        }
      />
      <DropdownContent
        aria-label={t`Avatar`}
        align="start"
        width={ICON_PICKER_DROPDOWN_CONTENT_WIDTH}
      >
        <StyledPopupContent data-click-outside-id={dropdownId}>
          <Dropdown.SelectionGroup
            aria-label={t`Shape`}
            closeOnSelect={false}
            value={shape}
            onValueChange={handleShapeChange}
          >
            <Dropdown.Section columns={5}>
              {AI_CHAT_ASSISTANT_AVATAR_SHAPES.map((avatarShape) => {
                const shapeLabel = t(
                  AI_CHAT_ASSISTANT_AVATAR_SHAPE_LABELS[avatarShape],
                );

                return (
                  <Dropdown.OptionItem
                    key={avatarShape}
                    aria-label={shapeLabel}
                    title={shapeLabel}
                    value={avatarShape}
                    indicator="none"
                    nativeButton
                    render={
                      <LightIconButton size="md" aria-label={shapeLabel}>
                        <AssistantAvatar
                          color={color}
                          shape={avatarShape}
                          size={16}
                        />
                      </LightIconButton>
                    }
                  />
                );
              })}
            </Dropdown.Section>
          </Dropdown.SelectionGroup>
          <Dropdown.Separator />
          <Dropdown.SelectionGroup
            aria-label={t`Color`}
            closeOnSelect={false}
            value={color}
            onValueChange={handleColorChange}
          >
            <Dropdown.Section columns={5}>
              {AI_CHAT_ASSISTANT_AVATAR_COLORS.map((avatarColor) => (
                <Dropdown.OptionItem
                  key={avatarColor}
                  aria-label={colorLabels[avatarColor]}
                  title={colorLabels[avatarColor]}
                  value={avatarColor}
                  indicator="none"
                  nativeButton
                  render={
                    <LightIconButton
                      size="md"
                      aria-label={colorLabels[avatarColor]}
                    >
                      <AssistantAvatar
                        color={avatarColor}
                        shape={shape}
                        size={16}
                      />
                    </LightIconButton>
                  }
                />
              ))}
            </Dropdown.Section>
          </Dropdown.SelectionGroup>
        </StyledPopupContent>
      </DropdownContent>
    </DropdownRoot>
  );
};
