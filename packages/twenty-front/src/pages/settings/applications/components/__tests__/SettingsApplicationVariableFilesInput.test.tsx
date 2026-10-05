import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from 'twenty-ui/components';

import {
  FileUploadContext,
  type FileUploadOptions,
} from '@/file-upload/contexts/FileUploadContext';
import { SettingsApplicationVariableFilesInput } from '~/pages/settings/applications/components/SettingsApplicationVariableFilesInput';

const mockUploadFile = jest.fn();

const LOGO_FILE = {
  fileId: '20202020-0000-4000-8000-000000000002',
  label: 'logo.png',
  extension: '.png',
  url: 'https://files.example/logo.png',
};
const TERMS_FILE = {
  fileId: '20202020-0000-4000-8000-000000000003',
  label: 'terms.pdf',
  extension: '.pdf',
  url: 'https://files.example/terms.pdf',
};

const renderInput = ({
  value = '',
  onChange = jest.fn(),
}: {
  value?: string;
  onChange?: (serializedValue: string) => void;
} = {}) => {
  let fileUploadOptions: FileUploadOptions | undefined;

  render(
    <I18nProvider i18n={i18n}>
      <ToastProvider>
        <FileUploadContext.Provider
          value={{
            openFileUpload: (options) => {
              fileUploadOptions = options;
            },
          }}
        >
          <SettingsApplicationVariableFilesInput
            uploadFile={mockUploadFile}
            value={value}
            onChange={onChange}
          />
        </FileUploadContext.Provider>
      </ToastProvider>
    </I18nProvider>,
  );

  return {
    onChange,
    selectFiles: (files: File[]) =>
      act(async () => {
        await fileUploadOptions?.onUpload(files);
      }),
  };
};

describe('SettingsApplicationVariableFilesInput', () => {
  beforeEach(() => {
    mockUploadFile.mockReset();
  });

  it('should list the uploaded files of the value', () => {
    renderInput({ value: JSON.stringify([LOGO_FILE, TERMS_FILE]) });

    expect(screen.getByText('logo.png')).toBeInTheDocument();
    expect(screen.getByText('terms.pdf')).toBeInTheDocument();
  });

  it('should drop a removed file from the value', async () => {
    const { onChange } = renderInput({
      value: JSON.stringify([LOGO_FILE, TERMS_FILE]),
    });

    const [removeLogo] = screen.getAllByRole('button', {
      name: 'Remove file',
    });

    await userEvent.click(removeLogo);

    expect(onChange).toHaveBeenCalledWith(JSON.stringify([TERMS_FILE]));
  });

  it('should empty the value when the last file is removed', async () => {
    const { onChange } = renderInput({ value: JSON.stringify([LOGO_FILE]) });

    await userEvent.click(screen.getByRole('button', { name: 'Remove file' }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should append the files picked for upload to the value', async () => {
    mockUploadFile.mockResolvedValue(TERMS_FILE);
    const { onChange, selectFiles } = renderInput({
      value: JSON.stringify([LOGO_FILE]),
    });

    await userEvent.click(screen.getByRole('button', { name: /Upload file/ }));
    await selectFiles([new File(['%PDF'], 'terms.pdf')]);

    expect(mockUploadFile).toHaveBeenCalledWith(expect.any(File));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        JSON.stringify([LOGO_FILE, TERMS_FILE]),
      ),
    );
  });
});
