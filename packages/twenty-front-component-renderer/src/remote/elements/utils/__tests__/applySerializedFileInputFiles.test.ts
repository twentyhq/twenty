import '@/remote/generated/remote-elements';

import { applySerializedFileInputFiles } from '../applySerializedFileInputFiles';

const createSelectedInput = () => {
  const input = document.createElement(
    'html-input',
  ) as unknown as HTMLInputElement;
  input.type = 'file';
  input.value = 'C:\\fakepath\\profile.png';
  const file = new File(['image'], 'profile.png', { type: 'image/png' });
  const files = [
    {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    },
  ];
  applySerializedFileInputFiles({ element: input, files });
  return { input, file, files };
};

describe('applySerializedFileInputFiles', () => {
  it('clears the worker input without invalidating the File held by its callback', () => {
    const { input, file } = createSelectedInput();
    const selectedFile = input.files?.[0];
    expect(selectedFile).toBe(file);
    input.value = '';
    expect(input.files).toHaveLength(0);
    expect(input.value).toBe('');
    expect(selectedFile?.name).toBe('profile.png');
  });

  it('preserves the value bridge and reset behavior across repeated snapshots', () => {
    const { input, files } = createSelectedInput();
    input.value = '';
    input.value = 'C:\\fakepath\\profile.png';
    applySerializedFileInputFiles({ element: input, files });
    expect(input.files).toHaveLength(1);
    expect(input.value).toBe('C:\\fakepath\\profile.png');
    input.value = '';
    expect(input.files).toHaveLength(0);
  });
});
