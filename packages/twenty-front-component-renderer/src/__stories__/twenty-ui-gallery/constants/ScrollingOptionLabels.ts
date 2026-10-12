export const SCROLLING_OPTION_LABELS = Array.from(
  { length: 40 },
  (_, optionIndex) => `Option ${String(optionIndex + 1).padStart(2, '0')}`,
);
