import Papa from 'papaparse';

const DEFAULT_PREVIEW_ROWS = 50;

export const fetchCsvPreview = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const text = await response.text();

  const result = Papa.parse(text, {
    preview: DEFAULT_PREVIEW_ROWS,
    skipEmptyLines: true,
    header: true,
  });

  const data = result.data as Record<string, string>[];

  const csvContent = Papa.unparse(data, {
    header: true,
  });

  return csvContent;
};
