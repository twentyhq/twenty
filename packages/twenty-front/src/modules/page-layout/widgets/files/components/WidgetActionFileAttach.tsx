import { AttachmentUploadTrigger } from '@/activities/files/components/AttachmentUploadTrigger';
import { useCanUploadAttachmentFiles } from '@/activities/files/hooks/useCanUploadAttachmentFiles';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';

export const WidgetActionFileAttach = () => {
  const targetRecord = useTargetRecord();
  const { canUploadFiles } = useCanUploadAttachmentFiles(targetRecord);

  if (!canUploadFiles) {
    return null;
  }

  return (
    <AttachmentUploadTrigger targetableObject={targetRecord}>
      {({ openFilePicker }) => (
        <WidgetCardHeaderActionButton
          Icon={IconPlus}
          label={t`Add file`}
          onClick={openFilePicker}
        />
      )}
    </AttachmentUploadTrigger>
  );
};
