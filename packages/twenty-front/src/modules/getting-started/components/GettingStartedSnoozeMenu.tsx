import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { type GettingStartedSnoozeOption } from '@/getting-started/types/GettingStartedSnoozeOption';
import { getGettingStartedSnoozedUntil } from '@/getting-started/utils/getGettingStartedSnoozedUntil';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconCalendar,
  IconClock,
  type IconComponent,
  IconDotsVertical,
  IconEyeOff,
  IconZzz,
} from 'twenty-ui/icon';
import { type UpdateGettingStartedInput } from '~/generated-metadata/graphql';

export const GettingStartedSnoozeMenu = () => {
  const { t } = useLingui();
  const dropdownId = `getting-started-snooze-${useId()}`;
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();
  const { trialEnd } = useGettingStartedTrial();
  const { timeZone, dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();

  const snoozeOptions: {
    option: GettingStartedSnoozeOption;
    label: string;
    Icon: IconComponent;
  }[] = [
    { option: 'hour', label: t`In an hour`, Icon: IconClock },
    { option: 'tomorrow', label: t`Tomorrow`, Icon: IconCalendar },
    { option: 'lastThreeDays', label: t`Until the last 3 days`, Icon: IconZzz },
  ];

  const updateAndNavigateHome = async (input: UpdateGettingStartedInput) => {
    await updateGettingStarted(input);
    navigate(defaultHomePagePath);
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
        width={GenericDropdownContentWidth.ExtraLarge}
        align="end"
        aria-label={t`Snooze Getting started`}
      >
        <Dropdown.Header>
          <Dropdown.Title>{t`Snooze Getting started`}</Dropdown.Title>
        </Dropdown.Header>
        <Dropdown.Section>
          {snoozeOptions.map(({ option, label, Icon }) => {
            const snoozedUntil = getGettingStartedSnoozedUntil({
              option,
              now: new Date(),
              timeZone,
              trialEnd,
            });

            return (
              <Dropdown.ActionItem
                key={option}
                startIcon={<Icon />}
                description={
                  isDefined(snoozedUntil)
                    ? formatDateISOStringToCustomUnicodeFormat({
                        date: snoozedUntil,
                        timeZone,
                        dateFormat: option === 'hour' ? timeFormat : dateFormat,
                        localeCatalog,
                      })
                    : undefined
                }
                descriptionPlacement="inline"
                disabled={isSaving || !isDefined(snoozedUntil)}
                onClick={() => void updateAndNavigateHome({ snoozedUntil })}
              >
                {label}
              </Dropdown.ActionItem>
            );
          })}
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconEyeOff />}
            disabled={isSaving}
            onClick={() => void updateAndNavigateHome({ isHidden: true })}
          >
            {t`Hide for good`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
