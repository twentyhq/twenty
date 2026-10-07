import { type ReactNode } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { Switch } from 'twenty-ui/primitives/input';

type SettingsLogicFunctionTriggerSectionProps = {
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  readonly: boolean;
  children?: ReactNode;
};

// Common scaffolding for the four trigger toggles on a logic function. Hides
// the section entirely when an installed app function doesn't use this trigger
// (read-only + disabled = nothing to show).
export const SettingsLogicFunctionTriggerSection = ({
  title,
  description,
  enabled,
  onEnabledChange,
  readonly,
  children,
}: SettingsLogicFunctionTriggerSectionProps) => {
  if (readonly && !enabled) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={title}
        description={description}
        adornment={
          readonly ? undefined : (
            <Switch
              aria-label={title}
              checked={enabled}
              onCheckedChange={onEnabledChange}
              size="sm"
            />
          )
        }
      />
      {enabled && children}
    </Section.Root>
  );
};
