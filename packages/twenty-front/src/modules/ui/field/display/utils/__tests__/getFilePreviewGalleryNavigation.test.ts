import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFilePreviewGalleryNavigation } from '@/ui/field/display/utils/getFilePreviewGalleryNavigation';

const PHOTOS: FieldFilesValue[] = [1, 2, 3].map((photoNumber) => ({
  fileId: `photo-${photoNumber}`,
  label: `photo-${photoNumber}.png`,
  extension: '.png',
  url: `https://example.com/photo-${photoNumber}.png`,
}));

describe('getFilePreviewGalleryNavigation', () => {
  it('returns nothing without a gallery holding the previewed file', () => {
    const onSelectFile = jest.fn();

    expect(
      getFilePreviewGalleryNavigation({
        galleryFiles: [],
        fileId: 'photo-1',
        onSelectFile,
      }),
    ).toBeUndefined();
    expect(
      getFilePreviewGalleryNavigation({
        galleryFiles: PHOTOS,
        fileId: 'report-file-id',
        onSelectFile,
      }),
    ).toBeUndefined();
  });

  it('moves to the previous and next files from the middle of the gallery', () => {
    const onSelectFile = jest.fn();

    const navigation = getFilePreviewGalleryNavigation({
      galleryFiles: PHOTOS,
      fileId: 'photo-2',
      onSelectFile,
    });

    expect(navigation?.positionLabel).toBe('2 / 3');

    navigation?.onPrevious?.();
    navigation?.onNext?.();

    expect(onSelectFile.mock.calls).toEqual([[PHOTOS[0]], [PHOTOS[2]]]);
  });

  it('stops at both ends of the gallery', () => {
    const onSelectFile = jest.fn();

    const firstNavigation = getFilePreviewGalleryNavigation({
      galleryFiles: PHOTOS,
      fileId: 'photo-1',
      onSelectFile,
    });
    const lastNavigation = getFilePreviewGalleryNavigation({
      galleryFiles: PHOTOS,
      fileId: 'photo-3',
      onSelectFile,
    });

    expect(firstNavigation?.onPrevious).toBeUndefined();
    expect(lastNavigation?.positionLabel).toBe('3 / 3');
    expect(lastNavigation?.onNext).toBeUndefined();
  });
});
