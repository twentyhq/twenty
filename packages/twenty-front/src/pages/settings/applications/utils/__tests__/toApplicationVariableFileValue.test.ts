import { toApplicationVariableFileValue } from '~/pages/settings/applications/utils/toApplicationVariableFileValue';

describe('toApplicationVariableFileValue', () => {
  it('should keep the picked file name as label and read the extension from the stored path', () => {
    expect(
      toApplicationVariableFileValue({
        file: new File(['%PDF'], 'Terms of service.pdf'),
        uploadedFile: {
          id: '20202020-0000-4000-8000-000000000003',
          path: 'application-variable/20202020-0000-4000-8000-000000000003.pdf',
          url: 'https://files.example/terms.pdf',
        },
      }),
    ).toEqual({
      fileId: '20202020-0000-4000-8000-000000000003',
      label: 'Terms of service.pdf',
      extension: '.pdf',
      url: 'https://files.example/terms.pdf',
    });
  });

  it('should leave the extension undefined when the stored path has none', () => {
    expect(
      toApplicationVariableFileValue({
        file: new File(['data'], 'LICENSE'),
        uploadedFile: {
          id: '20202020-0000-4000-8000-000000000003',
          path: 'application-variable/20202020-0000-4000-8000-000000000003',
          url: 'https://files.example/license',
        },
      }).extension,
    ).toBeUndefined();
  });
});
