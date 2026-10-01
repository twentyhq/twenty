import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { RadioGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearanceOption } from '~/pages/settings/profile/appearance/components/SettingsAppearanceOption';

const StyledChoices = styled.div`
  width: 100%;

  && {
    flex-direction: row;
    gap: ${themeCssVariables.spacing[4]};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow-x: auto;
  }
`;

export const SettingsAppearance = () => {
  const { t } = useLingui();
  const { colorScheme, setColorScheme } = useColorScheme();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const choices: { value: ColorScheme; label: string }[] = [
    { value: 'Light', label: t`Light` },
    { value: 'Dark', label: t`Dark` },
    { value: 'System', label: t`System settings` },
  ];

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
