import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { type GettingStartedSnoozeOption } from '@/getting-started/types/GettingStartedSnoozeOption';
import { getGettingStartedSnoozedUntil } from '@/getting-started/utils/getGettingStartedSnoozedUntil';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical } from 'twenty-ui/icon';

type GettingStartedSnoozeMenuProps = {
  side?: 'top' | 'bottom';
};

export const GettingStartedSnoozeMenu = ({
  side = 'bottom',
}: GettingStartedSnoozeMenuProps) => {
  const { t } = useLingui();
  const dropdownId = `getting-started-snooze-${useId()}`;
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();
  const { trialEnd } = useGettingStartedTrial();
  const { timeZone } = useDateTimeFormat();

  const snoozeOptions: { option: GettingStartedSnoozeOption; label: string }[] =
    [
      { option: 'hour', label: t`In an hour` },
      { option: 'tomorrow', label: t`Tomorrow` },
      { option: 'lastThreeDays', label: t`Until the last 3 days` },
    ];

  const getSnoozedUntil = (option: GettingStartedSnoozeOption) =>
    getGettingStartedSnoozedUntil({
      option,
      now: new Date(),
      timeZone,
      trialEnd,
    });

  const snooze = (option: GettingStartedSnoozeOption) => {
    const snoozedUntil = getSnoozedUntil(option);

    if (!isDefined(snoozedUntil)) {
      return;
    }

    void updateGettingStarted({ snoozedUntil });
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label={t`Snooze Getting started`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        side={side}
        align="end"
        aria-label={t`Snooze Getting started`}
      >
        <Dropdown.Header>
          <Dropdown.Title>{t`Snooze Getting started`}</Dropdown.Title>
        </Dropdown.Header>
        <Dropdown.Section>
          {snoozeOptions.map(({ option, label }) => (
            <Dropdown.ActionItem
              key={option}
              disabled={isSaving || !isDefined(getSnoozedUntil(option))}
              onClick={() => snooze(option)}
            >
              {label}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
