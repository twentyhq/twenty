import { plural } from '@lingui/core/macro';
import { type ToolRecordReference } from 'twenty-shared/ai';

import { ChatReferenceChip } from '@/ai-chat/message-content/components/ChatReferenceChip';

type ThinkingToolStepRecordsDetailProps = {
  recordReferences: ToolRecordReference[];
};

export const ThinkingToolStepRecordsDetail = ({
  recordReferences,
}: ThinkingToolStepRecordsDetailProps) => {
  const [firstRecordReference] = recordReferences;

  if (recordReferences.length === 1) {
    return (
      <ChatReferenceChip
        reference={{ kind: 'record', ...firstRecordReference }}
      />
    );
  }

  return plural(recordReferences.length, {
    one: '# record',
    other: '# records',
  });
};
