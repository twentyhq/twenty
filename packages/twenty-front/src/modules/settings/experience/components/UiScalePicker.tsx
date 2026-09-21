import { UI_SCALE_MULTIPLIERS } from '@/ui/theme/constants/UiScaleMultipliers';
import { useUiScale } from '@/ui/theme/hooks/useUiScale';
import { Select } from '@/ui/input/components/Select';
import { type UiScale } from '@/workspace-member/types/WorkspaceMember';
import { useLingui } from '@lingui/react/macro';

export const UiScalePicker = () => {
  const { t } = useLingui();
  const { uiScaleStep, setUiScaleStep } = useUiScale();

  const handleChange = (step: UiScale) => {
    void setUiScaleStep(step);
  };

  return (
    <Select
      dropdownId="ui-scale-picker"
      label={t`Scale`}
      dropdownWidth={218}
      dropdownWidthAuto
      fullWidth
      value={uiScaleStep}
      options={[
        {
          label: t`Smaller`,
          value: 'Smaller' as const,
          contextualText: `${Math.round(UI_SCALE_MULTIPLIERS.Smaller * 100)}%`,
        },
        {
          label: t`Default`,
          value: 'Default' as const,
          contextualText: `${Math.round(UI_SCALE_MULTIPLIERS.Default * 100)}%`,
        },
        {
          label: t`Large`,
          value: 'Large' as const,
          contextualText: `${Math.round(UI_SCALE_MULTIPLIERS.Large * 100)}%`,
        },
        {
          label: t`Larger`,
          value: 'Larger' as const,
          contextualText: `${Math.round(UI_SCALE_MULTIPLIERS.Larger * 100)}%`,
        },
      ]}
      onChange={handleChange}
    />
  );
};
