export type RecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

// Display names come from real record titles and routinely contain markdown
// special characters (backticks, brackets, pipes). Matching the display name
// non-greedily up to the closing "]]" lets titles like "[Billing] Tie key"
// survive, which "[^\]]+" would truncate at the first "]".
const RECORD_REFERENCE_REGEX =
  /\[\[(?:record:)?([a-zA-Z]+):([a-f0-9-]+):(.+?)\]\]/g;

// Private Use Area sentinels wrapping the reference index. They carry no
// markdown meaning, so the parser keeps each placeholder inside a single text
// node instead of fragmenting the original token on its special characters.
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
