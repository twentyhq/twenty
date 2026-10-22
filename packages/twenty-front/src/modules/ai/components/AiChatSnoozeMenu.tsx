import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconMessage,
  IconZzz,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { type AiChatSnoozePreset } from '@/ai/types/AiChatSnoozePreset';

const SNOOZE_MENU_WIDTH = 240;

type AiChatSnoozeMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: AiChatSnoozePreset[];
  onSelectPreset: (presetKey: AiChatSnoozePreset['key']) => void;
  onPickDate: () => void;
  onSomeoneReplies?: () => void;
  onAssistantFinishes?: () => void;
  assistantName?: string;
  disabled?: boolean;
};

export const AiChatSnoozeMenu = ({
  open,
  onOpenChange,
  presets,
  onSelectPreset,
  onPickDate,
  onSomeoneReplies,
  onAssistantFinishes,
  assistantName = AGENT_CHAT_ASSISTANT_NAME,
  disabled = false,
}: AiChatSnoozeMenuProps) => {
  const { t } = useLingui();
  const hasEventOptions =
    isDefined(onSomeoneReplies) || isDefined(onAssistantFinishes);

  return (
    <Dropdown.Root type="menu" open={open} onOpenChange={onOpenChange}>
      <Dropdown.Trigger
        disabled={disabled}
        render={
          <Button size="sm" variant="outline" startIcon={<IconZzz />}>
            {t`Snooze`}
          </Button>
        }
      />
      <Dropdown.Content
        width={SNOOZE_MENU_WIDTH}
        side="bottom"
        align="end"
        aria-label={t`Snooze chat`}
      >
        <Dropdown.Section>
          {presets.map((preset) => (
            <Dropdown.ActionItem
              key={preset.key}
              startIcon={<IconClock />}
              description={preset.description}
              descriptionPlacement="end"
              disabled={disabled}
              onClick={() => onSelectPreset(preset.key)}
            >
              {t(preset.label)}
            </Dropdown.ActionItem>
          ))}
          <Dropdown.ActionItem
            startIcon={<IconCalendarEvent />}
            disabled={disabled}
            onClick={onPickDate}
          >
            {t`Pick a date`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
        {hasEventOptions && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              {isDefined(onSomeoneReplies) && (
                <Dropdown.ActionItem
                  startIcon={<IconMessage />}
                  disabled={disabled}
                  onClick={onSomeoneReplies}
                >
                  {t`Someone replies`}
                </Dropdown.ActionItem>
              )}
              {isDefined(onAssistantFinishes) && (
                <Dropdown.ActionItem
                  startIcon={<IconCheck />}
                  disabled={disabled}
                  onClick={onAssistantFinishes}
                >
                  {t`When ${assistantName} finishes`}
                </Dropdown.ActionItem>
              )}
            </Dropdown.Section>
          </>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
