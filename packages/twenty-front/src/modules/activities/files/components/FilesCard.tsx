import { type ChangeEvent, useCallback, useMemo, useRef } from 'react';

import { FilesCardContent } from '@/activities/files/components/FilesCardContent';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledFileInput = styled.input`
  display: none;
`;

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

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(event.target.files)) {
      const files = Array.from(event.target.files);
      event.target.value = '';
      onUploadFiles(files);
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

  const handleAddFileClick = useCallback(() => {
    inputFileRef.current?.click();
  }, []);

  const headerActions = useMemo(
    () =>
      canUploadFiles
        ? [
            {
              id: 'add-file',
              Icon: IconPlus,
              label: t`Add file`,
              onClick: handleAddFileClick,
            },
          ]
        : undefined,
    [canUploadFiles, t, handleAddFileClick],
  );

  return (
    <>
      <WidgetHeaderInfoEffect
        count={totalCountAttachments}
        actions={headerActions}
      />
      <StyledFileInput
        ref={inputFileRef}
        onChange={handleFileInputChange}
        type="file"
        multiple
      />
      <FilesCardContent
        attachments={attachments}
        loading={loading}
        onAddFile={canUploadFiles ? handleAddFileClick : undefined}
        onUploadFiles={onUploadFiles}
        targetRecord={targetRecord}
      />
    </>
  );
};
