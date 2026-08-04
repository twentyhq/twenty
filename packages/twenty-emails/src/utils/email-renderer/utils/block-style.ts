import { type CSSProperties } from 'react';

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
