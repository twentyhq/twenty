import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type FormatNumberOptions } from '~/utils/format/formatNumber';

export const formatNumberFieldValue = ({
  value,
  settings,
  formatNumber,
}: {
  value: number;
  settings: FieldNumberMetadata['settings'];
  formatNumber: (
    value: number,
    options?: Omit<FormatNumberOptions, 'format'>,
  ) => string;
}) => {
  const decimals = settings?.decimals;

  return settings?.type === 'percentage'
    ? `${formatNumber(value * 100, { decimals })}%`
    : formatNumber(value, { decimals });
};
