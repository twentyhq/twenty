import { isNonEmptyString } from '@sniptt/guards';

import { UNKNOWN_SPEAKER_LABEL } from 'src/constants/teams.constant';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

const CUE_TIMING_PATTERN =
  /^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s+-->\s+(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;
const VOICE_TAG_PATTERN = /<v(?:\.[^\s>]*)?\s+([^>]*)>/i;
const ANY_TAG_PATTERN = /<\/?[^>]+>/g;

const parseTimestampToSeconds = (timestamp: string): number | undefined => {
  const [clock] = timestamp.trim().split(/\s+/);
  const parts = clock.replace(',', '.').split(':').map(Number);

  if (parts.some((part) => !Number.isFinite(part))) {
    return undefined;
  }

  if (parts.length === 3) {
    return parts[0] * 3_600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return undefined;
};

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

const parseCueText = (
  lines: string[],
): { speakerName: string; text: string } => {
  const joined = lines.join(' ');
  const voiceMatch = VOICE_TAG_PATTERN.exec(joined);
  const speakerName = decodeHtmlEntities(voiceMatch?.[1] ?? '').trim();
  const text = decodeHtmlEntities(joined.replace(ANY_TAG_PATTERN, ''))
    .replace(/\s+/g, ' ')
    .trim();

  return {
    speakerName: isNonEmptyString(speakerName)
      ? speakerName
      : UNKNOWN_SPEAKER_LABEL,
    text,
  };
};

const splitIntoBlocks = (content: string): string[][] =>
  content
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .reduce<string[][]>(
      (blocks, line) => {
        if (line.trim() === '') {
          if (blocks[blocks.length - 1].length > 0) {
            blocks.push([]);
          }

          return blocks;
        }

        blocks[blocks.length - 1].push(line);

        return blocks;
      },
      [[]],
    )
    .filter((block) => block.length > 0);

// Teams emits one cue per utterance with a `<v Speaker Name>` voice tag; the
// unattributed format Graph serves when speaker attribution is off has the
// same cues without the tag. Both map onto the CallRecording transcript shape
// the Call Recorder app writes, one entry per cue.
export const parseVttTranscript = (content: string): TranscriptEntry[] => {
  const entries: TranscriptEntry[] = [];

  for (const block of splitIntoBlocks(content)) {
    const firstLine = block[0].trim();

    if (firstLine.startsWith('WEBVTT') || firstLine.startsWith('NOTE')) {
      continue;
    }

    const timingLineIndex = block.findIndex((line) =>
      CUE_TIMING_PATTERN.test(line.trim()),
    );

    if (timingLineIndex === -1) {
      continue;
    }

    const { speakerName, text } = parseCueText(
      block.slice(timingLineIndex + 1),
    );

    if (!isNonEmptyString(text)) {
      continue;
    }

    const startSeconds = parseTimestampToSeconds(
      block[timingLineIndex].trim().split('-->')[0],
    );

    entries.push({
      participant: { name: speakerName },
      words: [
        {
          text,
          ...(startSeconds === undefined
            ? {}
            : { start_timestamp: { relative: startSeconds } }),
        },
      ],
    });
  }

  return entries;
};
