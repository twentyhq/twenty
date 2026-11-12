import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconDownload, IconEye } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledAttachments = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledActionChip = styled.div`
  display: inline-flex;

  & > button:first-child {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
`;

const StyledActionChipMenu = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
  width: ${themeCssVariables.spacing[5]};
`;

type EmailThreadMessageAttachmentsProps = {
  files: FieldFilesValue[];
};

export const EmailThreadMessageAttachments = ({
  files,
}: EmailThreadMessageAttachmentsProps) => {
  const { t } = useLingui();
  const { openFilePreview } = useOpenFilePreview();
  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  return (
    <StyledAttachments>
      {files.map((file) => {
        const isAvailable = !file.isDeleted;
        const fileUrl = file.url;

        return (
          <StyledActionChip key={file.fileId}>
            <FileChip file={file} onClick={openFilePreview} />
            {isAvailable && (
              <StyledActionChipMenu>
                <DropdownRoot
                  dropdownId={`${file.fileId}-email-attachment-dropdown`}
                  type="menu"
                >
                  <Dropdown.Trigger
                    render={
                      <LightIconButton
                        size="xs"
                        emphasis="subtle"
                        aria-label={t`More options`}
                      >
                        <IconDotsVertical />
                      </LightIconButton>
                    }
                  />
                  <DropdownContent
                    align="end"
                    width={GenericDropdownContentWidth.Narrow}
                  >
                    <Dropdown.Section>
                      <Dropdown.ActionItem
                        startIcon={<IconEye />}
                        onClick={() => openFilePreview(file)}
                      >
                        {t`Preview`}
                      </Dropdown.ActionItem>
                      {hasDownloadPermission && isNonEmptyString(fileUrl) && (
                        <Dropdown.ActionItem
                          startIcon={<IconDownload />}
                          onClick={() => downloadFile(fileUrl, file.label)}
                        >
                          {t`Download`}
                        </Dropdown.ActionItem>
                      )}
                    </Dropdown.Section>
                  </DropdownContent>
                </DropdownRoot>
              </StyledActionChipMenu>
            )}
          </StyledActionChip>
        );
      })}
    </StyledAttachments>
  );
};
