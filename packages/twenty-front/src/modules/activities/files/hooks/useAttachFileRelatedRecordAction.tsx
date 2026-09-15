import { AttachmentFileInput } from '@/activities/files/components/AttachmentFileInput';
import { useCanUploadAttachmentFiles } from '@/activities/files/hooks/useCanUploadAttachmentFiles';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { t } from '@lingui/core/macro';
import { useRef } from 'react';
import { IconPaperclip } from 'twenty-ui/icon';

type UseAttachFileRelatedRecordActionParams = {
  targetRecord: ActivityTargetableObject;
  onUploadComplete?: () => void;
};

export const useAttachFileRelatedRecordAction = ({
  targetRecord,
  onUploadComplete,
}: UseAttachFileRelatedRecordActionParams): RelatedRecordActionBinding => {
  const { canUploadFiles } = useCanUploadAttachmentFiles(targetRecord);
  const inputFileRef = useRef<HTMLInputElement>(null);

  return {
    action: {
      id: 'attach-file',
      label: t`Attach file`,
      Icon: IconPaperclip,
      isVisible: canUploadFiles,
      disabled: false,
      execute: () => inputFileRef.current?.click(),
    },
    supportElement: (
      <AttachmentFileInput
        ref={inputFileRef}
        targetableObject={targetRecord}
        onUploadComplete={onUploadComplete}
      />
    ),
  };
};
