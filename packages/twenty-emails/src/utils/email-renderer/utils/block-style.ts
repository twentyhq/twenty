import { type CSSProperties } from 'react';

// Block styles are stored as structured objects of camelCase CSS properties,
// so they drop straight onto react-email components. Anything malformed
// renders unstyled rather than throwing mid-send.
export const blockStyle = (value: unknown): CSSProperties => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  ) as CSSProperties;
};
