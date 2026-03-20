export type DataResidencyKey =
  | 'us'
  | 'eu'
  | 'global'
  | 'uk'
  | 'ap'
  | 'jp'
  | 'au'
  | 'ca'
  | 'de'
  | 'fr';

export const DATA_RESIDENCY_CONFIG: Record<
  DataResidencyKey,
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
