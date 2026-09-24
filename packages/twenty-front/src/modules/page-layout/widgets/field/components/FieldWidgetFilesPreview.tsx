import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { lazy, Suspense } from 'react';
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
        <Suspense
          key={file.fileId}
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
      ))}
    </StyledContainer>
  );
};
