export const NTH_PSEUDO_CLASS_COUNTING_BY_NAME = new Map([
  ['nth-child', { isCountedFromEnd: false, isOfType: false }],
  ['nth-last-child', { isCountedFromEnd: true, isOfType: false }],
  ['nth-of-type', { isCountedFromEnd: false, isOfType: true }],
  ['nth-last-of-type', { isCountedFromEnd: true, isOfType: true }],
]);
