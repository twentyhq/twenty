import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SalesfarceBadge } from '@/salesfarce/components/SalesfarceBadge';
import { SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { isSalesfarceActiveState } from '@/salesfarce/states/isSalesfarceActiveState';
import { enterSalesfarce } from '@/salesfarce/utils/enterSalesfarce';
import { useColorScheme } from '@/workspace-member/hooks/useColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { Section } from 'twenty-ui/components/layout';
import { RadioGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearanceOption } from '~/pages/settings/profile/appearance/components/SettingsAppearanceOption';
import { type SettingsAppearanceValue } from '~/pages/settings/profile/appearance/types/SettingsAppearanceValue';

const StyledChoices = styled.div`
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow-x: auto;
  }
`;

export const SettingsAppearance = () => {
  const { t } = useLingui();
  const { colorScheme, setColorScheme } = useColorScheme();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isSalesfarceActive = useAtomStateValue(isSalesfarceActiveState);
  const choices: {
    value: SettingsAppearanceValue;
    label: string;
    badge?: ReactNode;
  }[] = [
    { value: doNotTranslate('Light'), label: t`Light` },
    { value: doNotTranslate('Dark'), label: t`Dark` },
    { value: doNotTranslate('System'), label: t`System settings` },
    {
      value: SALESFARCE_APPEARANCE_VALUE,
      label: t`Salesfarce`,
      badge: <SalesfarceBadge>{t`Enterprise only`}</SalesfarceBadge>,
    },
  ];

  return (
    <Section.Root>
      <Section.Header title={t`Appearance`} />
      <RadioGroup
        orientation="horizontal"
        render={<StyledChoices />}
        aria-label={t`Appearance`}
        value={isSalesfarceActive ? SALESFARCE_APPEARANCE_VALUE : colorScheme}
        disabled={!isDefined(currentWorkspaceMember)}
        onValueChange={(value: SettingsAppearanceValue) => {
          if (value === SALESFARCE_APPEARANCE_VALUE) {
            enterSalesfarce();
            return;
          }

          void setColorScheme(value);
        }}
      >
        {choices.map(({ value, label, badge }) => (
          <SettingsAppearanceOption
            key={value}
            appearance={value}
            label={label}
            badge={badge}
          />
        ))}
      </RadioGroup>
    </Section.Root>
  );
};
