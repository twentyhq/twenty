import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { formatNumber } from '~/utils/format/formatNumber';

type NumberFormatSelectProps = {
  value: NumberFormat;
  onChange: (nextValue: NumberFormat) => void;
};

export const NumberFormatSelect = ({
  onChange,
  value,
}: NumberFormatSelectProps) => {
  const { t } = useLingui();

  const systemNumberFormat = NumberFormat[detectNumberFormat()];

  const systemNumberFormatLabel = formatNumber(1234.56, {
    format: systemNumberFormat,
    decimals: 2,
  });
  const commasAndDotExample = formatNumber(1234.56, {
    format: NumberFormat.COMMAS_AND_DOT,
    decimals: 2,
  });
  const spacesAndCommaExample = formatNumber(1234.56, {
    format: NumberFormat.SPACES_AND_COMMA,
    decimals: 2,
  });
  const dotsAndCommaExample = formatNumber(1234.56, {
    format: NumberFormat.DOTS_AND_COMMA,
    decimals: 2,
  });
  const apostropheAndDotExample = formatNumber(1234.56, {
    format: NumberFormat.APOSTROPHE_AND_DOT,
    decimals: 2,
  });

  return (
    <Select
      dropdownId="number-format-select"
      dropdownWidth={218}
      label={t`Number format`}
      dropdownWidthAuto
      fullWidth
      value={value}
      options={[
        {
          label: t`System Settings - ${systemNumberFormatLabel}`,
          value: NumberFormat.SYSTEM,
        },
        {
          label: t`Commas and dot - ${commasAndDotExample}`,
          value: NumberFormat.COMMAS_AND_DOT,
        },
        {
          label: t`Spaces and comma - ${spacesAndCommaExample}`,
          value: NumberFormat.SPACES_AND_COMMA,
        },
        {
          label: t`Dots and comma - ${dotsAndCommaExample}`,
          value: NumberFormat.DOTS_AND_COMMA,
        },
        {
          label: t`Apostrophe and dot - ${apostropheAndDotExample}`,
          value: NumberFormat.APOSTROPHE_AND_DOT,
        },
      ]}
      onChange={onChange}
    />
  );
};
