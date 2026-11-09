import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { type ToolInput } from '@/ai/types/ToolInput';
import { hasToolOutputFailed } from '@/ai/utils/tool-display/hasToolOutputFailed';
import { pickStatusLabel } from '@/ai/utils/tool-display/pickStatusLabel';

const RecordToAttachSchema = z.object({ objectNameSingular: z.string() });
const AttachConversationToRecordsInputSchema = z.object({
  records: z.array(RecordToAttachSchema),
});
const AttachConversationToRecordsOutputSchema = z.object({
  result: z.object({ attached: z.array(RecordToAttachSchema).min(1) }),
});

type RecordToAttach = z.infer<typeof RecordToAttachSchema>;

// remove the single-record branch with ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME
const parseRecordsToAttach = (input: ToolInput): RecordToAttach[] => {
  const batchInput = AttachConversationToRecordsInputSchema.safeParse(input);

  if (batchInput.success) {
    return batchInput.data.records;
  }

  const singleRecordInput = RecordToAttachSchema.safeParse(input);

  return singleRecordInput.success ? [singleRecordInput.data] : [];
};

export const buildAttachConversationToRecordsStatusMessage = ({
  input,
  isFinished,
  displayContext,
  output,
}: {
  input: ToolInput;
  isFinished: boolean;
  displayContext: Pick<ToolDisplayContext, 'objectMetadataItems'>;
  output?: unknown;
}): string => {
  const hasFailed = hasToolOutputFailed(output);
  const parsedOutput =
    AttachConversationToRecordsOutputSchema.safeParse(output);
  const records =
    isFinished && !hasFailed && parsedOutput.success
      ? parsedOutput.data.result.attached
      : parseRecordsToAttach(input);

  const objectNamesSingular = new Set(
    records.map((record) => record.objectNameSingular),
  );
  const objectMetadataItem =
    objectNamesSingular.size === 1
      ? displayContext.objectMetadataItems.find((metadataItem) =>
          objectNamesSingular.has(metadataItem.nameSingular),
        )
      : undefined;
  const recordCount = records.length;

  if (isDefined(objectMetadataItem) && recordCount === 1) {
    const objectLabel = objectMetadataItem.labelSingular.toLocaleLowerCase(
      i18n.locale,
    );

    return pickStatusLabel({
      isFinished,
      completedLabel: hasFailed
        ? t`Could not attach this conversation to the ${objectLabel}`
        : t`Attached this conversation to the ${objectLabel}`,
      loadingLabel: t`Attaching this conversation to the ${objectLabel}`,
    });
  }

  if (isDefined(objectMetadataItem)) {
    const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase(
      i18n.locale,
    );

    return pickStatusLabel({
      isFinished,
      completedLabel: hasFailed
        ? t`Could not attach this conversation to ${recordCount} ${objectLabelPlural}`
        : t`Attached this conversation to ${recordCount} ${objectLabelPlural}`,
      loadingLabel: t`Attaching this conversation to ${recordCount} ${objectLabelPlural}`,
    });
  }

  if (recordCount > 1) {
    return pickStatusLabel({
      isFinished,
      completedLabel: hasFailed
        ? t`Could not attach this conversation to ${recordCount} records`
        : t`Attached this conversation to ${recordCount} records`,
      loadingLabel: t`Attaching this conversation to ${recordCount} records`,
    });
  }

  return pickStatusLabel({
    isFinished,
    completedLabel: hasFailed
      ? t`Could not attach this conversation to a record`
      : t`Attached this conversation to a record`,
    loadingLabel: t`Attaching this conversation to a record`,
  });
};
