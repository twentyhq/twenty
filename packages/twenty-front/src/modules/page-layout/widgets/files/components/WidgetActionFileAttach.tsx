import { AttachmentFileInput } from '@/activities/files/components/AttachmentFileInput';
import { useCanUploadAttachmentFiles } from '@/activities/files/hooks/useCanUploadAttachmentFiles';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { useRef } from 'react';
import { IconPlus } from 'twenty-ui/icon';

export const WidgetActionFileAttach = () => {
  const targetRecord = useTargetRecord();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { canUploadFiles } = useCanUploadAttachmentFiles(targetRecord);

  if (!canUploadFiles) {
    return null;
  }

  return (
    <>
      <AttachmentFileInput ref={inputFileRef} targetableObject={targetRecord} />
      <WidgetCardHeaderActionButton
        Icon={IconPlus}
        label={t`Add file`}
        onClick={() => inputFileRef.current?.click()}
      />
    </>
  );
};
