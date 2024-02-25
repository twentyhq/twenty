export const EXPIRATION_DATES: {
  value: number | null;
  label: string;
}[] = [
  { label: '15 days', value: 15 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '1 year', value: 365 },
  { label: '2 years', value: 2 * 365 },
  { label: 'Never', value: null },
];
