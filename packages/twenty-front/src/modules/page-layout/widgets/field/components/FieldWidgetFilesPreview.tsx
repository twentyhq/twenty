import { downloadFile } from '@/activities/files/utils/downloadFile';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { lazy, Suspense } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledFilePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
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
  files: FieldFilesValue[];
};

export const FieldWidgetFilesPreview = ({
  files,
}: FieldWidgetFilesPreviewProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      {files.map((file) => (
        <StyledFilePreview key={file.fileId}>
          <StyledActions>
            <Button
              startIcon={<IconDownload />}
              size="sm"
              variant="outline"
              disabled={!isDefined(file.url)}
              onClick={() => {
                if (isDefined(file.url)) {
                  downloadFile(file.url, file.label);
                }
              }}
            >{t`Download`}</Button>
          </StyledActions>
          <Suspense
            fallback={
              <StyledLoadingText>{t`Loading document viewer...`}</StyledLoadingText>
            }
          >
            <DocumentViewer
              documentName={file.label}
              documentUrl={file.url ?? ''}
              documentExtension={file.extension}
            />
          </Suspense>
        </StyledFilePreview>
      ))}
    </StyledContainer>
  );
};
