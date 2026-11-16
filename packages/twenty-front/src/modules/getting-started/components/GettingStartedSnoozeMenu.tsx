import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { getGettingStartedSnoozedUntil } from '@/getting-started/utils/getGettingStartedSnoozedUntil';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconEyeOff, IconZzz } from 'twenty-ui/icon';
import { type UpdateGettingStartedInput } from '~/generated-metadata/graphql';

export const GettingStartedSnoozeMenu = () => {
  const { t } = useLingui();
  const dropdownId = `getting-started-snooze-${useId()}`;
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();
  const { timeZone } = useDateTimeFormat();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );
  const canHide = billingHasPaymentMethod !== false;

  const updateAndNavigateHome = async (input: UpdateGettingStartedInput) => {
    const isUpdated = await updateGettingStarted(input);

    if (isUpdated) {
      navigate(defaultHomePagePath);
    }
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
        width={GenericDropdownContentWidth.Medium}
        align="end"
        aria-label={t`Snooze Getting started`}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconZzz />}
            disabled={isSaving}
            onClick={() =>
              void updateAndNavigateHome({
                snoozedUntil: getGettingStartedSnoozedUntil({
                  now: new Date(),
                  timeZone,
                }),
              })
            }
          >
            {t`Snooze`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
        {canHide && (
          <>
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
          </>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
