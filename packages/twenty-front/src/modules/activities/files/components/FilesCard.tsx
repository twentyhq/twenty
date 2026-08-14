import { useMemo, useRef } from 'react';

import { FilesCardContent } from '@/activities/files/components/FilesCardContent';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const FilesCard = () => {
  const targetRecord = useTargetRecord();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { attachments, loading, totalCountAttachments } =
    useAttachments(targetRecord);
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const { t } = useLingui();

  const onUploadFile = async (file: File) => {
    await uploadAttachmentFile(file, targetRecord);
  };

  const onUploadFiles = async (files: File[]) => {
    for (const file of files) {
      await onUploadFile(file);
    }
  };

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  const canUploadFiles = hasObjectUpdatePermissions && hasUploadPermission;

  const addFileAction = useMemo(
    () =>
      canUploadFiles
        ? {
            id: 'add-file',
            Icon: IconPlus,
            label: t`Add file`,
            onClick: () => inputFileRef?.current?.click?.(),
          }
        : undefined,
    [canUploadFiles, t],
  );

  return (
    <>
      <WidgetHeaderInfoEffect
        count={totalCountAttachments}
        actions={isDefined(addFileAction) ? [addFileAction] : undefined}
      />
      <FilesCardContent
        attachments={attachments}
        canUploadFiles={canUploadFiles}
        inputFileRef={inputFileRef}
        loading={loading}
        onUploadFiles={onUploadFiles}
        targetRecord={targetRecord}
      />
    </>
  );
};
