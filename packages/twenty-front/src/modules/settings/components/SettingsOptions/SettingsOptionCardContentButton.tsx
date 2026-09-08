import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { SettingsCardContent } from 'twenty-ui/surfaces';

type SettingsOptionCardContentButtonProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  disabled?: boolean;
  Button?: React.ReactNode;
};

export const SettingsOptionCardContentButton = ({
  Icon,
  title,
  description,
  Button,
}: SettingsOptionCardContentButtonProps) => {
  return (
    <SettingsCardContent
      icon={Icon && <SettingsOptionIconCustomizer Icon={Icon} />}
      title={title}
      description={
        description && <OverflowingTextWithTooltip text={description} />
      }
    >
      {Button}
    </SettingsCardContent>
  );
};
