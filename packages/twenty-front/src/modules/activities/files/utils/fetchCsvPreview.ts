import Papa from 'papaparse';

const DEFAULT_PREVIEW_ROWS = 50;

export type CsvPreviewData = {
  headers: string[];
  rows: string[][];
};

export const fetchCsvPreview = async (url: string): Promise<CsvPreviewData> => {
  const response = await fetch(url);
  const text = await response.text();

  const result = Papa.parse<string[]>(text, {
    preview: DEFAULT_PREVIEW_ROWS + 1, // +1 for header row
    skipEmptyLines: true,
    header: false,
  });

  const [headers = [], ...rows] = result.data;

  return { headers, rows };
};
