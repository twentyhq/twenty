import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useDownloadFakeRecords } from '@/spreadsheet-import/steps/components/UploadStep/hooks/useDownloadFakeRecords';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { saveAs } from 'file-saver';
import { type ReactNode } from 'react';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow');

const mockSaveAs = jest.mocked(saveAs);
const mockUseContextStoreObjectMetadataItemOrThrow = jest.mocked(
  useContextStoreObjectMetadataItemOrThrow,
);

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const jobTitleFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'jobTitle',
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const readBlob = async (blob: Blob): Promise<ArrayBuffer> =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) {
        reject(new Error('Expected the file contents to be an ArrayBuffer'));

        return;
      }

      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

describe('useDownloadFakeRecords', () => {
  beforeEach(() => {
    mockSaveAs.mockClear();
    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: {
        ...personObjectMetadataItem,
        updatableFields: [{ ...jobTitleFieldMetadataItem, label: 'مالک' }],
      },
    });
  });

  it('downloads a sample CSV starting with a UTF-8 BOM', async () => {
    const { result } = renderHook(() => useDownloadFakeRecords(), {
      wrapper: Wrapper,
    });

    result.current.downloadSample();

    const [blob, fileName] = mockSaveAs.mock.calls[0];

    if (!(blob instanceof Blob)) {
      throw new Error('Expected the downloaded file to be a Blob');
    }

    const bytes = Buffer.from(await readBlob(blob));

    expect(fileName).toBe('people-sample.csv');
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(bytes.toString('utf-8').split('\n')[0]).toBe('﻿مالک');
  });
});
