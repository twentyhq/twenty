import { fetchCsvPreview } from '@/activities/files/utils/fetchCsvPreview';

const mockFetch = (text: string) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve(text),
    } as unknown as Response),
  );
};

describe('fetchCsvPreview', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should parse headers and rows from CSV', async () => {
    mockFetch('Name,Age,City\nAlice,30,Paris\nBob,25,London\n');

    const result = await fetchCsvPreview('https://example.com/file.csv');

    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.rows).toEqual([
      ['Alice', '30', 'Paris'],
      ['Bob', '25', 'London'],
    ]);
  });

  it('should return empty headers and rows for empty CSV', async () => {
    mockFetch('');

    const result = await fetchCsvPreview('https://example.com/empty.csv');

    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('should return headers with no rows when CSV has only a header line', async () => {
    mockFetch('Name,Age,City\n');

    const result = await fetchCsvPreview('https://example.com/header-only.csv');

    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.rows).toEqual([]);
  });

  it('should skip empty lines', async () => {
    mockFetch('Name,Age\n\nAlice,30\n\nBob,25\n');

    const result = await fetchCsvPreview('https://example.com/file.csv');

    expect(result.rows).toEqual([
      ['Alice', '30'],
      ['Bob', '25'],
    ]);
  });

  it('should handle rows with inconsistent column counts', async () => {
    mockFetch('Name,Age,City\nAlice,30\nBob,25,London,Extra\n');

    const result = await fetchCsvPreview('https://example.com/malformed.csv');

    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.rows).toEqual([
      ['Alice', '30'],
      ['Bob', '25', 'London', 'Extra'],
    ]);
  });

  it('should limit rows to the preview amount', async () => {
    const lines = ['Name'];
    for (let i = 0; i < 100; i++) {
      lines.push(`Person${i}`);
    }
    mockFetch(lines.join('\n'));

    const result = await fetchCsvPreview('https://example.com/large.csv');

    expect(result.headers).toEqual(['Name']);
    expect(result.rows).toHaveLength(50);
  });
});
