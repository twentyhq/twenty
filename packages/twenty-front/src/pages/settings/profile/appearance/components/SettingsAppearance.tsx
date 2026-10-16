import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/workspace-member/hooks/useColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { RadioGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearanceOption } from '~/pages/settings/profile/appearance/components/SettingsAppearanceOption';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

const StyledChoices = styled.div`
  flex-direction: row;
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
  // ColorScheme values are persisted identifiers; the adjacent labels are translated.
  // oxlint-disable lingui/no-unlocalized-strings
  const choices: { value: ColorScheme; label: string }[] = [
    { value: 'Light', label: t`Light` },
    { value: 'Dark', label: t`Dark` },
    { value: 'System', label: t`System settings` },
  ];
  // oxlint-enable lingui/no-unlocalized-strings

  return (
    <Section.Root>
      <Section.Header title={t`Appearance`} />
      <RadioGroup
        render={<StyledChoices />}
        aria-label={t`Appearance`}
        value={colorScheme}
        disabled={!isDefined(currentWorkspaceMember)}
        onValueChange={(value: ColorScheme) => {
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
