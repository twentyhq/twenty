import { TipTapPdfDocument } from '@/command-menu-item/record/single-record/components/TipTapPdfDocument';
import { collectTipTapImageSources } from '@/command-menu-item/record/single-record/utils/collectTipTapImageSources';
import { fetchPdfImageObjectUrl } from '@/command-menu-item/record/single-record/utils/fetchPdfImageObjectUrl';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { isDefined, type TipTapDocument } from 'twenty-shared/utils';

export const exportTipTapDocumentToPdf = async ({
  document,
  filename,
}: {
  document: TipTapDocument;
  filename: string;
}) => {
  const imageSources = [...new Set(collectTipTapImageSources(document))];

  const imageObjectUrls = await Promise.all(
    imageSources.map(async (source) => ({
      source,
      objectUrl: await fetchPdfImageObjectUrl(source),
    })),
  );

  const resolvedImageSources = new Map<string, string>();

  for (const { source, objectUrl } of imageObjectUrls) {
    if (isDefined(objectUrl)) {
      resolvedImageSources.set(source, objectUrl);
    }
  }

  try {
    const blob = await pdf(
      <TipTapPdfDocument
        document={document}
        resolvedImageSources={resolvedImageSources}
      />,
    ).toBlob();

    saveAs(blob, `${filename}.pdf`);
  } finally {
    resolvedImageSources.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
  }
};
