import { isNumber } from '@sniptt/guards';

// Edits arrive as text; they are converted back to the type the approved
// value had, and the server validates the result like a new proposal.
export const parseAiActionFieldDraftValue = (
  draftValue: string,
  originalValue: unknown,
): unknown => {
  const trimmedValue = draftValue.trim();

  if (trimmedValue === '') {
    return null;
  }

  if (isNumber(originalValue)) {
    const numberValue = Number(trimmedValue);

    return Number.isFinite(numberValue) ? numberValue : trimmedValue;
  }

  if (typeof originalValue === 'boolean') {
    return trimmedValue.toLowerCase() === 'true';
  }

  return trimmedValue;
};
