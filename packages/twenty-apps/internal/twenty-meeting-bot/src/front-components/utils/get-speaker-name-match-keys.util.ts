import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const MINIMUM_FUZZY_MATCH_KEY_LENGTH = 5;

export const getSpeakerNameMatchKeys = (speakerName: string): string[] => {
  const normalizedSpeakerName = normalizeSpeakerName(speakerName);
  const compactSpeakerName = getCompactSpeakerName(normalizedSpeakerName);
  const compactSpeakerNameWithoutDigits = compactSpeakerName.replace(/\d/g, '');
  const abbreviatedSpeakerNameMatchKey =
    getAbbreviatedSpeakerNameMatchKey(normalizedSpeakerName);

  return [
    ...new Set(
      [
        normalizedSpeakerName,
        compactSpeakerName,
        compactSpeakerNameWithoutDigits,
        abbreviatedSpeakerNameMatchKey,
      ].filter(isSpeakerNameMatchKey),
    ),
  ];
};

const normalizeSpeakerName = (speakerName: string): string =>
  speakerName
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();

const getCompactSpeakerName = (speakerName: string): string =>
  normalizeSpeakerName(speakerName).replace(/[^a-z0-9]/g, '');

const getAbbreviatedSpeakerNameMatchKey = (
  speakerName: string,
): string | undefined => {
  const speakerNameParts = normalizeSpeakerName(speakerName)
    .split(/\s+/)
    .map(getCompactSpeakerName)
    .filter(isNonEmptyString);

  if (speakerNameParts.length < 2) {
    return undefined;
  }

  const firstSpeakerNamePart = speakerNameParts[0];
  const lastSpeakerNamePart = speakerNameParts[speakerNameParts.length - 1];
  const abbreviatedSpeakerNameMatchKey = `${firstSpeakerNamePart.slice(
    0,
    4,
  )}${lastSpeakerNamePart.slice(0, 4)}`;

  return abbreviatedSpeakerNameMatchKey.length >=
    MINIMUM_FUZZY_MATCH_KEY_LENGTH
    ? abbreviatedSpeakerNameMatchKey
    : undefined;
};

const isSpeakerNameMatchKey = (
  speakerNameMatchKey: string | undefined,
): speakerNameMatchKey is string =>
  isNonEmptyString(speakerNameMatchKey) &&
  (speakerNameMatchKey.includes(' ') ||
    speakerNameMatchKey.length >= MINIMUM_FUZZY_MATCH_KEY_LENGTH);
