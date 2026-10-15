import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';

type SettingsSearchFilterTriggerProps = {
  ariaLabel?: string;
};

export const SettingsSearchFilterTrigger = ({
  ariaLabel,
}: SettingsSearchFilterTriggerProps) => {
  const { t } = useLingui();

  return (
    <Dropdown.Trigger
      render={
        <IconButton aria-label={ariaLabel ?? t`Filter`}>
          <IconFilter />
        </IconButton>
      }
    />
  );
};
