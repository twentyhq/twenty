import { FilePreviewDialogNavigationHotkeysEffect } from '@/ui/field/display/components/FilePreviewDialogNavigationHotkeysEffect';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
import { lazy, Suspense, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconX,
} from 'twenty-ui/icon';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { useLingui } from '@lingui/react/macro';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const StyledPreviewLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-2);
  min-height: 0;
  padding: var(--t-spacing-2);
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: var(--t-spacing-2);
  justify-content: space-between;
  min-height: var(--t-spacing-10);
`;

const StyledTitle = styled.h2`
  min-width: 0;
  overflow: hidden;
  text-align: start;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: var(--t-spacing-1);
`;

const StyledPreviewContent = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
`;

const StyledNavigation = styled.div`
  align-items: center;
  display: flex;
  gap: var(--t-spacing-1);
`;

const StyledNavigationPosition = styled.span`
  color: var(--t-font-color-tertiary);
  font-size: var(--t-font-size-sm);
  font-variant-numeric: tabular-nums;
`;

type FilePreviewDialogProps = {
  dialogId: string;
  scrollWrapperId: string;
  title: string;
  documentName: string;
  documentUrl: string;
  documentExtension?: string;
  onClose: () => void;
  positionLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onDownload?: () => void;
  downloadLabel: string;
  loadingFallback: ReactNode;
};

export const FilePreviewDialog = ({
  dialogId,
  scrollWrapperId,
  title,
  documentName,
  documentUrl,
  documentExtension,
  onClose,
  positionLabel,
  onPrevious,
  onNext,
  onDownload,
  downloadLabel,
  loadingFallback,
}: FilePreviewDialogProps) => {
  const { t } = useLingui();
  const hasNavigation = isDefined(positionLabel);

  return (
    <DialogInstance
      dialogId={dialogId}
      dismissible
      onClose={onClose}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup onKeyDown={onKeyDown} size="lg">
          {hasNavigation && (
            <FilePreviewDialogNavigationHotkeysEffect
              dialogId={dialogId}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          )}
          <StyledPreviewLayout>
            <StyledHeader>
              <Dialog.Title size="md" render={<StyledTitle />}>
                {title}
              </Dialog.Title>
              <StyledActions>
                {hasNavigation && (
                  <StyledNavigation>
                    <IconButton
                      aria-label={t`Previous file`}
                      disabled={!isDefined(onPrevious)}
                      onClick={onPrevious}
                      size="sm"
                    >
                      <IconChevronLeft />
                    </IconButton>
                    <StyledNavigationPosition>
                      {positionLabel}
                    </StyledNavigationPosition>
                    <IconButton
                      aria-label={t`Next file`}
                      disabled={!isDefined(onNext)}
                      onClick={onNext}
                      size="sm"
                    >
                      <IconChevronRight />
                    </IconButton>
                  </StyledNavigation>
                )}
                {isDefined(onDownload) && (
                  <IconButton
                    aria-label={downloadLabel}
                    onClick={onDownload}
                    size="sm"
                  >
                    <IconDownload />
                  </IconButton>
                )}
                <IconButton
                  aria-label={t`Close preview`}
                  onClick={onClose}
                  size="sm"
                >
                  <IconX />
                </IconButton>
              </StyledActions>
            </StyledHeader>
            <ScrollWrapper componentInstanceId={scrollWrapperId}>
              <StyledPreviewContent>
                <Suspense fallback={loadingFallback}>
                  <DocumentViewer
                    key={documentUrl}
                    documentName={documentName}
                    documentUrl={documentUrl}
                    documentExtension={documentExtension}
                  />
                </Suspense>
              </StyledPreviewContent>
            </ScrollWrapper>
          </StyledPreviewLayout>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
