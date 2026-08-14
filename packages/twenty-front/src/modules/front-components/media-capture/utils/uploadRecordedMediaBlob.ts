import {
  type MediaRecordingMediaType,
  type StopMediaRecordingResult,
} from 'twenty-front-component-renderer';

import { getMediaCaptureFileExtension } from '@/front-components/media-capture/utils/getMediaCaptureFileExtension';
import { type useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { FileFolder } from '~/generated-metadata/graphql';

type UploadRecordedMediaBlobParams = {
  recordedBlob: Blob;
  mediaType: MediaRecordingMediaType;
  fieldMetadataId: string;
  durationSeconds: number;
  uploadFile: ReturnType<typeof useDirectFileUpload>['uploadFile'];
};

export const uploadRecordedMediaBlob = async ({
  recordedBlob,
  mediaType,
  fieldMetadataId,
  durationSeconds,
  uploadFile,
}: UploadRecordedMediaBlobParams): Promise<StopMediaRecordingResult> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${mediaType}-recording-${timestamp}.${getMediaCaptureFileExtension(recordedBlob.type)}`;

    const recordedFile = new File([recordedBlob], filename, {
      type: recordedBlob.type,
    });

    const uploadedFile = await uploadFile(recordedFile, {
      fileFolder: FileFolder.FilesField,
      fieldMetadataId,
    });

    return {
      status: 'captured',
      file: {
        fileId: uploadedFile.id,
        path: uploadedFile.path,
        url: uploadedFile.url,
        size: uploadedFile.size,
        mimeType: recordedBlob.type.split(';')[0],
        durationSeconds,
      },
    };
  } catch {
    return { status: 'failed', reason: 'upload-failed' };
  }
};
