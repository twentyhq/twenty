import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AGENT_AVATAR_COLORS, AGENT_AVATAR_SHAPES } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';
import { CORE_AGENT_AVATAR_SHAPE_LABELS } from '@/object-core/agents/constants/CoreAgentAvatarShapeLabels';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
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
  size: number;
};

export const CoreAgentAvatarPicker = ({
  agent,
  isReadOnly,
  size,
}: CoreAgentAvatarPickerProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const colorLabels = useColorLabels();
  const { draft, updateDraft } = useCoreAgentDraft(agent);

  const { color, shape } = getCoreAgentAvatar({
    agentId: agent.id,
    avatarColor: draft.avatarColor,
    avatarShape: draft.avatarShape,
  });
  const dropdownId = `core-agent-avatar-picker-${agent.id}`;

  if (isReadOnly) {
    return <AiAgentAvatar color={color} shape={shape} size={size} />;
  }

  const handleShapeChange = (value: string | null) => {
    const avatarShape = AGENT_AVATAR_SHAPES.find(
      (agentAvatarShape) => agentAvatarShape === value,
    );

    if (!isDefined(avatarShape)) {
      return;
    }

    updateDraft((currentDraft) => ({ ...currentDraft, avatarShape }));
  };

  const handleColorChange = (value: string | null) => {
    const avatarColor = AGENT_AVATAR_COLORS.find(
      (agentAvatarColor) => agentAvatarColor === value,
    );

    if (!isDefined(avatarColor)) {
      return;
    }

    updateDraft((currentDraft) => ({ ...currentDraft, avatarColor }));
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger
        render={
          <StyledAvatarButton type="button" aria-label={t`Change avatar`}>
            <AiAgentAvatar color={color} shape={shape} size={size} />
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
              {AGENT_AVATAR_SHAPES.map((avatarShape) => {
                const shapeLabel = t(
                  CORE_AGENT_AVATAR_SHAPE_LABELS[avatarShape],
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
                        <AiAgentAvatar
                          color={color}
                          shape={avatarShape}
                          size={theme.icon.size.md}
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
              {AGENT_AVATAR_COLORS.map((avatarColor) => (
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
                      <AiAgentAvatar
                        color={avatarColor}
                        shape={shape}
                        size={theme.icon.size.md}
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
