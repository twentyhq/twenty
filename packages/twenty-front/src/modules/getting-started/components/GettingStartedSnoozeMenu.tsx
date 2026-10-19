import { useId } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { IconDotsVertical } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useGettingStarted } from '@/getting-started/hooks/useGettingStarted';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import {
  getGettingStartedSnoozedUntil,
  type GettingStartedSnooze,
} from '@/getting-started/utils/getGettingStartedSnoozedUntil';
import { useToast } from 'twenty-ui/components/feedback';

export const GettingStartedSnoozeMenu = ({
  placement = 'bottom',
}: {
  placement?: 'top' | 'bottom';
}) => {
  const { t } = useLingui();
  const id = useId();
  const { snooze, saving } = useGettingStarted();
  const { userTimezone, trialEnd } = useGettingStartedTrial();
  const { enqueueToast } = useToast();
  const options: { id: GettingStartedSnooze; label: string }[] = [
    { id: 'hour', label: t`In an hour` },
    { id: 'tomorrow', label: t`Tomorrow` },
    { id: 'lastThreeDays', label: t`Until the last 3 days` },
  ];
  const getTarget = (option: GettingStartedSnooze) =>
    getGettingStartedSnoozedUntil({
      option,
      now: new Date(),
      timeZone: userTimezone,
      trialEnd,
    });
  const select = async (option: GettingStartedSnooze) => {
    const target = getTarget(option);
    if (!target) return;
    try {
      await snooze(target);
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not snooze Getting started. Please try again.`,
      });
    }
  };
  return (
    <DropdownRoot dropdownId={`getting-started-snooze-${id}`} type="menu">
      <Dropdown.Trigger
        render={
          <Button
            size="sm"
            variant="ghost"
            aria-label={t`Snooze Getting started`}
          >
            <IconDotsVertical size={14} />
          </Button>
        }
      />
      <DropdownContent
        width={220}
        side={placement}
        align="end"
        aria-label={t`Snooze Getting started`}
      >
        <Dropdown.Header>
          <Dropdown.Title>{t`Snooze Getting started`}</Dropdown.Title>
        </Dropdown.Header>
        {options.map((option) => (
          <Dropdown.ActionItem
            key={option.id}
            disabled={saving || !getTarget(option.id)}
            onClick={() => void select(option.id)}
          >
            {option.label}
          </Dropdown.ActionItem>
        ))}
      </DropdownContent>
    </DropdownRoot>
  );
};
