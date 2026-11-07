import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Card } from 'twenty-ui/primitives/surfaces';
import { SettingsAiAssistantChoiceContent } from '~/pages/settings/ai/components/SettingsAiAssistantChoiceContent';
import { SettingsAiAssistantCustomizeMenu } from '~/pages/settings/ai/components/SettingsAiAssistantCustomizeMenu';

type SettingsAiAssistantCustomizeProps = {
  value: AiChatAssistantProfile;
  onChange: (value: AiChatAssistantProfile) => void;
  disabled: boolean;
  isCustom: boolean;
  describedBy?: string;
};

export const SettingsAiAssistantCustomize = ({
  value,
  onChange,
  disabled,
  isCustom,
  describedBy,
}: SettingsAiAssistantCustomizeProps) => {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  if (disabled && isOpen) {
    setIsOpen(false);
  }

  return (
    <Dropdown.Root type="panel" open={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger
        disabled={disabled}
        aria-label={t`Customize`}
        aria-pressed={isCustom}
        aria-describedby={describedBy}
        render={
          <Card.Root
            render={<button type="button" />}
            borderStyle={isCustom ? 'solid' : 'dashed'}
            isSelected={isCustom}
            fullWidth
          >
            <Card.Content>
              <SettingsAiAssistantChoiceContent
                value={value}
                title={t`Customize`}
                description={t`Shape, color, face`}
                isCustomize
              />
            </Card.Content>
          </Card.Root>
        }
      />
      <Dropdown.Content
        aria-label={t`Customize assistant`}
        width={240}
        align="end"
        sideOffset={4}
      >
        <SettingsAiAssistantCustomizeMenu
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
