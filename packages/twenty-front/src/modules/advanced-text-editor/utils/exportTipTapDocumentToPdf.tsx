import { TipTapPdfDocument } from '@/advanced-text-editor/components/TipTapPdfDocument';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { type TipTapDocument } from 'twenty-shared/utils';

export const exportTipTapDocumentToPdf = async ({
  document,
  filename,
}: {
  document: TipTapDocument;
  filename: string;
}) => {
  const blob = await pdf(<TipTapPdfDocument document={document} />).toBlob();

  saveAs(blob, `${filename}.pdf`);
};
