import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
// Salesfarce: on removal, import useColorScheme from '@/workspace-member/hooks/useColorScheme'
import { useSalesfarceColorScheme } from '@/salesfarce/hooks/useSalesfarceColorScheme';
// Salesfarce: remove with the theme
import { SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { Section } from 'twenty-ui/components/layout';
import { RadioGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearanceOption } from '~/pages/settings/profile/appearance/components/SettingsAppearanceOption';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

const StyledChoices = styled.div`
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow-x: auto;
  }
`;

export const SettingsAppearance = () => {
  const { t } = useLingui();
  // Salesfarce: on removal, call useColorScheme() instead
  const { colorScheme, setColorScheme } = useSalesfarceColorScheme();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const choices: {
    // Salesfarce: on removal, drop the Salesfarce union
    value: ColorScheme | typeof SALESFARCE_APPEARANCE_VALUE;
    label: string;
  }[] = [
    { value: doNotTranslate('Light'), label: t`Light` },
    { value: doNotTranslate('Dark'), label: t`Dark` },
    { value: doNotTranslate('System'), label: t`System settings` },
    // Salesfarce: remove with the theme
    { value: SALESFARCE_APPEARANCE_VALUE, label: t`Salesfarce` },
  ];

  return (
    <Section.Root>
      <Section.Header title={t`Appearance`} />
      <RadioGroup
        orientation="horizontal"
        render={<StyledChoices />}
        aria-label={t`Appearance`}
        value={colorScheme}
        disabled={!isDefined(currentWorkspaceMember)}
        // Salesfarce: on removal, drop the Salesfarce union
        onValueChange={(
          value: ColorScheme | typeof SALESFARCE_APPEARANCE_VALUE,
        ) => {
          void setColorScheme(value);
        }}
      >
        {choices.map(({ value, label }) => (
          <SettingsAppearanceOption
            key={value}
            colorScheme={value}
            label={label}
          />
        ))}
      </RadioGroup>
    </Section.Root>
  );
};
