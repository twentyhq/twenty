import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { AGENT_AVATAR_COLORS, AGENT_AVATAR_SHAPES } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';
import { CoreAgentAvatar } from '@/object-core/agents/components/CoreAgentAvatar';
import { CORE_AGENT_AVATAR_SHAPE_LABELS } from '@/object-core/agents/constants/CoreAgentAvatarShapeLabels';
import { useSaveCoreAgentAvatar } from '@/object-core/agents/hooks/useSaveCoreAgentAvatar';
import { coreAgentAvatarPendingUpdatesFamilyState } from '@/object-core/agents/states/coreAgentAvatarPendingUpdatesFamilyState';
import { type CoreAgentAvatarIdentity } from '@/object-core/agents/types/CoreAgentAvatarIdentity';
import { getCoreAgentAvatarAppearance } from '@/object-core/agents/utils/getCoreAgentAvatarAppearance';
import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const DEFAULT_AGENT_AVATAR_SIZE = 24;

type CoreAgentAvatarPickerProps = {
  agent: CoreAgentAvatarIdentity;
  disabled?: boolean;
  size?: number;
};

export const CoreAgentAvatarPicker = ({
  agent,
  disabled = false,
  size = DEFAULT_AGENT_AVATAR_SIZE,
}: CoreAgentAvatarPickerProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownId = useId();
  const colorLabels = useColorLabels();
  const { saveCoreAgentAvatar } = useSaveCoreAgentAvatar();
  const coreAgentAvatarPendingUpdates = useAtomFamilyStateValue(
    coreAgentAvatarPendingUpdatesFamilyState,
    agent.id,
  );
  const appearance = getCoreAgentAvatarAppearance({
    agent,
    pendingUpdates: coreAgentAvatarPendingUpdates,
  });
  const isSaving = isNonEmptyArray(coreAgentAvatarPendingUpdates);

  if (disabled) {
    return <CoreAgentAvatar agent={agent} size={size} />;
  }

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Change avatar`}
            aria-busy={isSaving}
            emphasis="subtle"
            size="md"
          >
            <CoreAgentAvatar agent={agent} size={size} />
          </LightIconButton>
        }
      />
      <DropdownContent
        aria-label={t`Agent avatar`}
        align="start"
        width={ICON_PICKER_DROPDOWN_CONTENT_WIDTH}
      >
        <Dropdown.SelectionGroup
          aria-label={t`Shape`}
          value={isDefined(appearance.icon) ? null : appearance.shape}
          closeOnSelect={false}
          onValueChange={(value) => {
            const shape = AGENT_AVATAR_SHAPES.find((shape) => shape === value);

            if (isDefined(shape)) {
              void saveCoreAgentAvatar({
                agentId: agent.id,
                patch: { avatarShape: shape },
              });
            }
          }}
        >
          <Dropdown.Section columns={5}>
            {AGENT_AVATAR_SHAPES.map((shape) => (
              <Dropdown.OptionItem
                key={shape}
                value={shape}
                aria-label={t(CORE_AGENT_AVATAR_SHAPE_LABELS[shape])}
                indicator="none"
                nativeButton
                render={
                  <LightIconButton
                    aria-label={t(CORE_AGENT_AVATAR_SHAPE_LABELS[shape])}
                  >
                    <AiAgentAvatar
                      color={appearance.color}
                      shape={shape}
                      size={theme.icon.size.md}
                    />
                  </LightIconButton>
                }
              />
            ))}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
        <Dropdown.Separator />
        <Dropdown.SelectionGroup
          aria-label={t`Color`}
          value={isDefined(appearance.icon) ? null : appearance.color}
          closeOnSelect={false}
          onValueChange={(value) => {
            const color = AGENT_AVATAR_COLORS.find((color) => color === value);

            if (isDefined(color)) {
              void saveCoreAgentAvatar({
                agentId: agent.id,
                patch: { avatarColor: color },
              });
            }
          }}
        >
          <Dropdown.Section columns={5}>
            {AGENT_AVATAR_COLORS.map((color) => (
              <Dropdown.OptionItem
                key={color}
                value={color}
                aria-label={colorLabels[color]}
                indicator="none"
                nativeButton
                render={
                  <LightIconButton aria-label={colorLabels[color]}>
                    <AiAgentAvatar
                      color={color}
                      shape={appearance.shape}
                      size={theme.icon.size.md}
                    />
                  </LightIconButton>
                }
              />
            ))}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};
