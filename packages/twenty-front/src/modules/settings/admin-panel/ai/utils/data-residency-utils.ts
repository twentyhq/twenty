const DATA_RESIDENCY_CONFIG: Record<
  string,
  { label: string; flag: string }
> = {
  us: { label: 'United States', flag: '🇺🇸' },
  eu: { label: 'European Union', flag: '🇪🇺' },
  global: { label: 'Global', flag: '🌐' },
  uk: { label: 'United Kingdom', flag: '🇬🇧' },
  ap: { label: 'Asia Pacific', flag: '🌏' },
  jp: { label: 'Japan', flag: '🇯🇵' },
  au: { label: 'Australia', flag: '🇦🇺' },
  ca: { label: 'Canada', flag: '🇨🇦' },
  de: { label: 'Germany', flag: '🇩🇪' },
  fr: { label: 'France', flag: '🇫🇷' },
};

export const getDataResidencyLabel = (residency: string): string => {
  return DATA_RESIDENCY_CONFIG[residency]?.label ?? residency.toUpperCase();
};

export const getDataResidencyFlag = (residency: string): string => {
  return DATA_RESIDENCY_CONFIG[residency]?.flag ?? '🌐';
};

export const getDataResidencyDisplay = (residency: string): string => {
  const flag = getDataResidencyFlag(residency);
  const label = getDataResidencyLabel(residency);

  return `${flag} ${label}`;
};

export const DATA_RESIDENCY_OPTIONS = Object.entries(
  DATA_RESIDENCY_CONFIG,
).map(([value, { label, flag }]) => ({
  value,
  label: `${flag}  ${label}`,
}));
