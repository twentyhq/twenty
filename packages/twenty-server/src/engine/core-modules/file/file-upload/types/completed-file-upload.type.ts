import { type FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export type CompletedFileUpload = FileWithSignedUrlDTO &
  Pick<FileEntity, 'mimeType'>;
