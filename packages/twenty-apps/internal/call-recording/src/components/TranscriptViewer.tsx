import { useMemo } from 'react';

import { SummaryViewer } from 'src/components/SummaryViewer';
import { type TranscriptEntry } from 'src/hooks/useTranscript';

type TranscriptViewerProps = {
  entries: TranscriptEntry[];
};

const entriesToMarkdown = (entries: TranscriptEntry[]): string =>
  entries
    .map((entry) => {
      const speaker = entry.participant?.name ?? 'Unknown';
      const text = entry.words.map((word) => word.text).join(' ');

      return `**${speaker}:** ${text}`;
    })
    .join('\n\n');

export const TranscriptViewer = ({ entries }: TranscriptViewerProps) => {
  const markdown = useMemo(() => entriesToMarkdown(entries), [entries]);

  if (entries.length === 0) {
    return;
  }

  return <SummaryViewer markdown={markdown} />;
};
