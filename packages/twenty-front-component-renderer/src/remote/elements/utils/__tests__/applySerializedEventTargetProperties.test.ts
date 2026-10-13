import '@/remote/generated/remote-elements';

import { applySerializedEventTargetProperties } from '../applySerializedEventTargetProperties';

const SELECTED_FILE_VALUE = 'C:\\fakepath\\profile.png';

const applySelectedFile = ({
  input,
  file,
}: {
  input: HTMLInputElement;
  file: File;
}) =>
  applySerializedEventTargetProperties({
    element: input,
    eventData: { type: 'change', value: SELECTED_FILE_VALUE, files: [file] },
  });

const createSelectedFileInput = () => {
  const input = document.createElement(
    'html-input',
  ) as unknown as HTMLInputElement;
  const file = new File(['image'], 'profile.png', { type: 'image/png' });
  input.type = 'file';
  applySelectedFile({ input, file });
  return { input, file };
};

describe('applySerializedEventTargetProperties', () => {
  it('clears the worker file input without invalidating the File held by its callback', () => {
    const { input, file } = createSelectedFileInput();
    const selectedFile = input.files?.[0];
    expect(selectedFile).toBe(file);
    input.value = '';
    expect(input.files).toHaveLength(0);
    expect(input.value).toBe('');
    expect(selectedFile?.name).toBe('profile.png');
  });

  it('preserves the value bridge and file reset across repeated selections', () => {
    const { input, file } = createSelectedFileInput();
    input.value = '';
    applySelectedFile({ input, file });
    expect(input.files).toHaveLength(1);
    expect(input.value).toBe(SELECTED_FILE_VALUE);
    input.value = '';
    expect(input.files).toHaveLength(0);
  });
});
