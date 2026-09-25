import { PREVIEWABLE_EXTENSIONS } from '@/activities/files/const/previewable-extensions.const';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { lazy, Suspense } from 'react';
import { IconDownload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledLoadingText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]};
`;

type FieldWidgetFilesPreviewProps = {
  file: FieldFilesValue & { url: string };
};

export const FieldWidgetFilesPreview = ({
  file,
}: FieldWidgetFilesPreviewProps) => {
  const { t } = useLingui();

  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const fileExtension = (
    file.extension ??
    getFileNameAndExtension(file.label).extension ??
    ''
  )
    .toLowerCase()
    .replace('.', '');

  // Files the viewer cannot render already come with their own download
  // action inside the unavailable-preview state.
  const isPreviewable = PREVIEWABLE_EXTENSIONS.includes(fileExtension);

  return (
    <StyledContainer>
      {hasDownloadPermission && isPreviewable && (
        <StyledActions>
          <Button
            startIcon={<IconDownload />}
            size="sm"
            variant="outline"
            onClick={() => downloadFile(file.url, file.label)}
          >{t`Download`}</Button>
        </StyledActions>
      )}
      <Suspense
        fallback={
          <StyledLoadingText>{t`Loading document viewer...`}</StyledLoadingText>
        }
      >
        <DocumentViewer
          documentName={file.label}
          documentUrl={file.url}
          documentExtension={file.extension}
        />
      </Suspense>
    </StyledContainer>
  );
};
