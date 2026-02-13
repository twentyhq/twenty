import { StyledSettingsCardDescription } from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { type ReactNode } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type SettingsOptionCardDescriptionProps = {
  description?: ReactNode;
};

export const SettingsOptionCardDescription = ({
  description,
}: SettingsOptionCardDescriptionProps) => {
  if (
    description === null ||
    description === undefined ||
    typeof description === 'boolean'
  ) {
    return null;
  }

  if (typeof description === 'string' || typeof description === 'number') {
    return (
      <StyledSettingsCardDescription>
        <OverflowingTextWithTooltip text={String(description)} />
      </StyledSettingsCardDescription>
    );
  }

  return (
    <StyledSettingsCardDescription>{description}</StyledSettingsCardDescription>
  );
};
