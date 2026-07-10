import { isImageFilePath } from 'src/engine/core-modules/application/application-registration/utils/is-image-file-path.util';

describe('isImageFilePath', () => {
  it.each([
    'public/logo.png',
    'public/shot.JPG',
    'a/b/c.jpeg',
    'image.webp',
    'anim.gif',
    'icon.svg',
    'photo.avif',
  ])('returns true for image path %s', (filePath) => {
    expect(isImageFilePath(filePath)).toBe(true);
  });

  it.each([
    'public/data.json',
    'public/styles.css',
    'script.mjs',
    'README',
    'archive.tar.gz',
    'noextension',
  ])('returns false for non-image path %s', (filePath) => {
    expect(isImageFilePath(filePath)).toBe(false);
  });
});
