import { PREVIEWABLE_EXTENSIONS } from '@/activities/files/const/previewable-extensions.const';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import {
  type CsvPreviewData,
  fetchCsvPreview,
} from '@/activities/files/utils/fetchCsvPreview';
import { getFileType } from '@/activities/files/utils/getFileType';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const MS_OFFICE_EXTENSIONS = [
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'odt',
];

const StyledDocumentViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 500px;
  width: 100%;
  background: ${({ theme }) => theme.background.secondary};

  #react-doc-viewer #header-bar {
    display: none;
  }

  #react-doc-viewer #pdf-controls {
    display: none !important;
  }

  #react-doc-viewer,
  #proxy-renderer,
  #msdoc-renderer {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: auto;
    background: none;
  }
`;

const StyledUnavailablePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledMessage = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  max-width: 400px;
`;

const StyledLightMessage = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCsvTable = styled.table`
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: left;
  width: 100%;

  th {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.tertiary};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    height: ${({ theme }) => theme.spacing(8)};
    padding: 0 ${({ theme }) => theme.spacing(2)};
  }

  td {
    color: ${({ theme }) => theme.font.color.secondary};
    height: ${({ theme }) => theme.spacing(8)};
    max-width: 200px;
    overflow: hidden;
    padding: 0 ${({ theme }) => theme.spacing(2)};
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

type DocumentViewerProps = {
  documentName: string;
  documentUrl: string;
  documentExtension?: string;
};

// MS Office Online viewer requires documents to be publicly accessible from the internet.
// For private/local URLs, Microsoft's servers cannot fetch the document.
//
// We explored more sophisticated detection approaches but they don't work:
// - postMessage: Microsoft's viewer doesn't send any error messages
// - Fetching the embed URL: Blocked by CORS (no Access-Control-Allow-Origin header)
// - Reading iframe content: Cross-origin restrictions prevent access
//
// This simple URL-based detection catches the most common cases (localhost, private IPs)
// where the preview will definitely fail. For edge cases on non-standard private networks,
// users will see Microsoft's error page but can still download the file.
//
// See: https://github.com/twentyhq/twenty/issues/16900
const isPrivateUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]'
    ) {
      return true;
    }

    const ipParts = hostname.split('.').map(Number);
    if (ipParts.length === 4 && ipParts.every((part) => !isNaN(part))) {
      if (ipParts[0] === 10) return true;
      if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31)
        return true;
      if (ipParts[0] === 192 && ipParts[1] === 168) return true;
    }

    if (
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.internal')
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const MIME_TYPE_MAPPING: Record<
  (typeof PREVIEWABLE_EXTENSIONS)[number],
  string
> = {
  bmp: 'image/bmp',
  csv: 'text/csv',
  odt: 'application/vnd.oasis.opendocument.text',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  gif: 'image/gif',
  htm: 'text/html',
  html: 'text/html',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  tiff: 'image/tiff',
  txt: 'text/plain',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4',
  webp: 'image/webp',
};

export const DocumentViewer = ({
  documentName,
  documentUrl,
  documentExtension,
}: DocumentViewerProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [csvPreview, setCsvPreview] = useState<CsvPreviewData | undefined>(
    undefined,
  );

  const { extension } = getFileNameAndExtension(documentName);
  const fileExtension = isDefined(documentExtension)
    ? documentExtension.toLowerCase().replace('.', '')
    : (extension?.toLowerCase().replace('.', '') ?? '');
  const fileCategory = getFileType(documentName);
  const isPreviewable = PREVIEWABLE_EXTENSIONS.includes(fileExtension);
  const isMsOfficeFile = MS_OFFICE_EXTENSIONS.includes(fileExtension);

  const mimeType = isPreviewable ? MIME_TYPE_MAPPING[fileExtension] : undefined;

  useEffect(() => {
    if (fileExtension === 'csv') {
      fetchCsvPreview(documentUrl).then(setCsvPreview);
    }
  }, [documentUrl, fileExtension]);

  if (!isPreviewable) {
    return (
      <StyledDocumentViewerContainer>
        <StyledUnavailablePreviewContainer>
          <StyledTitle>
            <Trans>Preview Not Available</Trans>
          </StyledTitle>
          <StyledMessage>
            {fileCategory === 'ARCHIVE' ? (
              <Trans>
                Archive files cannot be previewed. Please download the file to
                access its contents.
              </Trans>
            ) : (
              <Trans>
                This file type cannot be previewed. Please download the file to
                view it.
              </Trans>
            )}
          </StyledMessage>
          <Button
            Icon={IconDownload}
            title={t`Download File`}
            onClick={() => downloadFile(documentUrl, documentName)}
            variant="secondary"
          />
        </StyledUnavailablePreviewContainer>
      </StyledDocumentViewerContainer>
    );
  }

  if (fileExtension === 'csv') {
    if (!isDefined(csvPreview)) {
      return (
        <StyledDocumentViewerContainer>
          <Trans>Loading csv ... </Trans>
        </StyledDocumentViewerContainer>
      );
    }
    return (
      <StyledDocumentViewerContainer style={{ background: 'transparent' }}>
        <StyledCsvTable>
          <thead>
            <tr>
              {csvPreview.headers.map((header, columnIndex) => (
                <th key={columnIndex}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvPreview.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledCsvTable>
      </StyledDocumentViewerContainer>
    );
  }

  if (isMsOfficeFile && isPrivateUrl(documentUrl)) {
    return (
      <StyledDocumentViewerContainer>
        <StyledUnavailablePreviewContainer>
          <StyledLightMessage>
            <Trans>
              This file cannot be previewed because it is hosted locally.
            </Trans>
          </StyledLightMessage>
          <Button
            Icon={IconDownload}
            title={t`Download`}
            onClick={() => downloadFile(documentUrl, documentName)}
            variant="secondary"
            size="small"
          />
        </StyledUnavailablePreviewContainer>
      </StyledDocumentViewerContainer>
    );
  }

  return (
    <StyledDocumentViewerContainer>
      <DocViewer
        documents={[
          {
            uri: documentUrl,
            fileName: documentName,
            fileType: mimeType,
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        style={{
          height: '100%',
          color: theme.font.color.primary,
          backgroundColor: theme.background.primary,
        }}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: false,
          },
          pdfVerticalScrollByDefault: true,
          pdfZoom: {
            defaultZoom: 1,
            zoomJump: 0.1,
          },
        }}
        theme={{
          primary: theme.background.primary,
          secondary: theme.background.secondary,
          tertiary: theme.background.tertiary,
          textPrimary: theme.font.color.primary,
          textSecondary: theme.font.color.secondary,
          textTertiary: theme.font.color.tertiary,
          disableThemeScrollbar: true,
        }}
      />
    </StyledDocumentViewerContainer>
  );
};
