import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type TranscriptEntry } from 'src/features/transcripts/logic-functions/types/transcript-entry.type';

type TeamsTranscriptCue = {
  startSeconds: number;
  lines: string[];
};

type TeamsTranscriptUtterance = {
  startSeconds: number;
  speakerName: string | undefined;
  text: string;
};

const isCueTimingLine = (line: string): boolean =>
  /^-?(?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3}\s+-->\s+-?(?:\d+:)?\d{1,2}:\d{2}[.,]\d{1,3}/.test(
    line.trim(),
  );

const isMetadataBlock = (block: string[]): boolean =>
  /^(WEBVTT|NOTE|STYLE|REGION)\b/.test(block[0].trim());

const parseCueStartSeconds = (timingLine: string): number => {
  const [startTimestamp] = timingLine.trim().split(/\s+-->/);

  if (startTimestamp.startsWith('-')) {
    return 0;
  }

  const [seconds, minutes, hours = 0] = startTimestamp
    .replace(',', '.')
    .split(':')
    .map(Number)
    .reverse();

  return hours * 3_600 + minutes * 60 + seconds;
};

const splitIntoBlocks = (content: string): string[][] => {
  const blocks: string[][] = [[]];

  for (const line of content.replace(/^﻿/, '').split(/\r?\n/)) {
    if (isNonEmptyString(line.trim())) {
      blocks[blocks.length - 1].push(line);
    } else {
      blocks.push([]);
    }
  }

  return blocks.filter((block) => block.length > 0);
};

const groupBlocksIntoCues = (blocks: string[][]): TeamsTranscriptCue[] => {
  const cues: TeamsTranscriptCue[] = [];

  for (const block of blocks) {
    const timingLineIndex = block.findIndex(isCueTimingLine);
    const lastCue = cues[cues.length - 1];

    if (timingLineIndex !== -1) {
      cues.push({
        startSeconds: parseCueStartSeconds(block[timingLineIndex]),
        lines: block.slice(timingLineIndex + 1),
      });
    } else if (!isMetadataBlock(block) && isDefined(lastCue)) {
      lastCue.lines.push(...block);
    }
  }

  return cues;
};

// Repeats until stable so that removing one tag cannot leave another behind.
const stripCueTags = (cueText: string): string => {
  let text = cueText;
  let previousText: string | undefined;

  while (text !== previousText) {
    previousText = text;
    text = text.replace(/<\/?[^>]+>/g, '');
  }

  return text;
};

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

const toUtterance = ({
  startSeconds,
  lines,
}: TeamsTranscriptCue): TeamsTranscriptUtterance | undefined => {
  const cueText = lines.join(' ');
  const speakerName = decodeHtmlEntities(
    /<v(?:\.[^\s>]*)?\s+([^>]*)>/i.exec(cueText)?.[1] ?? '',
  ).trim();
  const text = decodeHtmlEntities(stripCueTags(cueText))
    .replace(/\s+/g, ' ')
    .trim();

  if (!isNonEmptyString(text)) {
    return undefined;
  }

  return {
    startSeconds,
    speakerName: isNonEmptyString(speakerName) ? speakerName : undefined,
    text,
  };
};

export const mapTeamsTranscriptToEntries = (
  content: string,
): TranscriptEntry[] => {
  const entries: TranscriptEntry[] = [];
  const utterances = groupBlocksIntoCues(splitIntoBlocks(content))
    .map(toUtterance)
    .filter(isDefined);

  for (const { startSeconds, speakerName, text } of utterances) {
    const lastEntry = entries[entries.length - 1];
    const word = { text, start_timestamp: { relative: startSeconds } };

    if (isDefined(speakerName) && lastEntry?.participant.name === speakerName) {
      lastEntry.words.push(word);
    } else {
      entries.push({
        participant: { name: speakerName ?? null },
        words: [word],
      });
    }
  }

  return entries;
};
