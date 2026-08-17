import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ChangeEvent, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledFileInput = styled.input`
  display: none;
`;

export const WidgetActionFileAttach = () => {
  const targetRecord = useTargetRecord();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  const canUploadFiles =
    objectPermissions.canUpdateObjectRecords && hasUploadPermission;

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDefined(event.target.files)) {
      const files = Array.from(event.target.files);
      event.target.value = '';

      for (const file of files) {
        await uploadAttachmentFile(file, targetRecord);
      }
    }
  };

  if (!canUploadFiles) {
    return null;
  }

  return (
    <>
      <StyledFileInput
        ref={inputFileRef}
        onChange={handleFileInputChange}
        type="file"
        multiple
      />
      <WidgetCardHeaderActionButton
        Icon={IconPlus}
        label={t`Add file`}
        onClick={() => inputFileRef.current?.click()}
      />
    </>
  );
};
