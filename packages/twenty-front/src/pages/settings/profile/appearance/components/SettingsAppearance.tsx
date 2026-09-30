import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearancePreview } from '~/pages/settings/profile/appearance/components/SettingsAppearancePreview';

const StyledChoices = styled.div`
  box-sizing: border-box;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[4]};
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledChoice = styled.div`
  flex: 1 1 0;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex: 0 0 160px;
  }
`;

const StyledChoiceContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-inline-end: ${themeCssVariables.spacing[6]};
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
          <Radio
            render={<StyledChoice />}
            key={value}
            variant="card"
            value={value}
            aria-label={label}
          >
            <StyledChoiceContent>
              <StyledLabel>{label}</StyledLabel>
              <SettingsAppearancePreview colorScheme={value} />
            </StyledChoiceContent>
          </Radio>
        ))}
      </RadioGroup>
    </Section.Root>
  );
};
