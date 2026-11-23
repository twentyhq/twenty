import { buildRemoteFileExtension } from 'src/engine/core-modules/file/files-field/utils/build-remote-file-extension.util';

describe('buildRemoteFileExtension', () => {
  it('keeps the lowercased extension of an ordinary filename', () => {
    expect(buildRemoteFileExtension('Q3 Report.PDF')).toBe('pdf');
  });

  it('falls back to bin when the filename has no extension, since storage paths require one', () => {
    expect(buildRemoteFileExtension('README')).toBe('bin');
  });

  it('falls back to bin when the extension would break path validation', () => {
    expect(buildRemoteFileExtension('facture.pdfé')).toBe('bin');
    expect(buildRemoteFileExtension('invoice.pdf/../../secret')).toBe('bin');
  });
});
