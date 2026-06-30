import { readFileAsync } from '@/spreadsheet-import/utils/readFilesAsync';

describe('readFileAsync', () => {
  it('should resolve with the file content as ArrayBuffer', async () => {
    const file = new File(['Test content'], 'test.txt', { type: 'text/plain' });
    const result = await readFileAsync(file);
    expect(result).toBeInstanceOf(ArrayBuffer);
  });
});
