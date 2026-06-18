import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

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
  const { theme } = useContext(ThemeContext);

  if (readonly && !enabled) {
    return null;
  }

  return (
    <Section>
      <StyledHeader>
        <H2Title title={title} description={description} />
        {!readonly && (
          <Toggle
            value={enabled}
            onChange={onEnabledChange}
            toggleSize="small"
            color={theme.color.blue}
          />
        )}
      </StyledHeader>
      {enabled && children}
    </Section>
  );
};
