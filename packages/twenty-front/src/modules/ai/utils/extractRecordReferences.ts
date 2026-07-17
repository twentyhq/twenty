export type RecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

// Non-greedy display name up to the closing "]]" so titles containing "]" (e.g.
// "[Billing] Tie key") survive, unlike "[^\]]+" which stops at the first "]".
const RECORD_REFERENCE_REGEX =
  /\[\[(?:record:)?([a-zA-Z]+):([a-f0-9-]+):(.*?)\]\]/g;

// Private Use Area sentinels carry no markdown meaning, so the parser keeps each
// placeholder in one text node instead of fragmenting the token on its content.
const PLACEHOLDER_START = '\uE000';
const PLACEHOLDER_END = '\uE001';

export const RECORD_REFERENCE_PLACEHOLDER_REGEX = /\uE000(\d+)\uE001/g;

export const extractRecordReferences = (
  text: string,
): { sanitizedText: string; references: RecordReference[] } => {
  const references: RecordReference[] = [];

  const sanitizedText = text.replace(
    RECORD_REFERENCE_REGEX,
    (_match, objectNameSingular, recordId, displayName) => {
      const index = references.length;
      references.push({ objectNameSingular, recordId, displayName });
      return `${PLACEHOLDER_START}${index}${PLACEHOLDER_END}`;
    },
  );

  return { sanitizedText, references };
};

export const buildRecordReferenceToken = ({
  objectNameSingular,
  recordId,
  displayName,
}: RecordReference): string =>
  `[[record:${objectNameSingular}:${recordId}:${displayName}]]`;
