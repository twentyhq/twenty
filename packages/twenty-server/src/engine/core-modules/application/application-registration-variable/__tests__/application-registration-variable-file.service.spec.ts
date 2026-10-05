import { Readable } from 'stream';

import { FileFolder, ServerFileFolder } from 'twenty-shared/types';

import { ApplicationRegistrationVariableFileService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable-file.service';
import { ApplicationRegistrationExceptionCode } from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const REGISTRATION_ID = '20202020-0000-4000-8000-000000000002';
const UPLOAD_FILE_ID = '20202020-0000-4000-8000-000000000003';
const LOGO_FILE_ID = '20202020-0000-4000-8000-000000000004';
const OLD_LOGO_FILE_ID = '20202020-0000-4000-8000-000000000005';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000006';

const buildUpload = (overrides: Partial<FileEntity> = {}): FileEntity =>
  ({
    id: UPLOAD_FILE_ID,
    workspaceId: WORKSPACE_ID,
    applicationId: APPLICATION_ID,
    path: `${FileFolder.ApplicationRegistrationVariableUpload}/${UPLOAD_FILE_ID}.png`,
    status: FILE_STATUS.PENDING,
    mimeType: 'application/octet-stream',
    settings: { isTemporaryFile: true, toDelete: false },
    ...overrides,
  }) as FileEntity;

const buildServerFile = (overrides: Partial<FileEntity> = {}): FileEntity =>
  ({
    id: LOGO_FILE_ID,
    workspaceId: null,
    applicationRegistrationId: REGISTRATION_ID,
    path: `${ServerFileFolder.ApplicationRegistrationVariable}/${REGISTRATION_ID}/${LOGO_FILE_ID}.png`,
    status: FILE_STATUS.UPLOADED,
    size: 24,
    mimeType: 'image/png',
    createdAt: new Date('2026-10-05T00:00:00Z'),
    settings: { isTemporaryFile: true, toDelete: false },
    ...overrides,
  }) as FileEntity;

describe('ApplicationRegistrationVariableFileService', () => {
  const fileRepository = { findOne: jest.fn() };
  const applicationRepository = {
    findOneOrFail: jest.fn(async () => ({
      id: APPLICATION_ID,
      universalIdentifier: 'custom-app',
    })),
  };
  const applicationRegistrationRepository = {
    existsBy: jest.fn(async () => true),
  };
  const fileStorageService = {
    readFile: jest.fn(async () => Readable.from([Buffer.from('png')])),
    deleteByFileId: jest.fn(),
  };
  const serverFileStorageService = {
    writeServerFile: jest.fn(),
    findServerFilesByIds: jest.fn(),
    updateServerFilesSettings: jest.fn(),
    deleteServerFileById: jest.fn(),
  };
  const fileUploadCompletionService = {
    completeUploadedFile: jest.fn(async () => ({ mimeType: 'image/png' })),
  };
  const fileUrlService = {
    signServerFileByIdUrl: jest.fn(
      async ({ fileId }: { fileId: string }) => `https://signed/${fileId}`,
    ),
  };

  const service = new ApplicationRegistrationVariableFileService(
    fileRepository as never,
    applicationRepository as never,
    applicationRegistrationRepository as never,
    fileStorageService as never,
    serverFileStorageService as never,
    fileUploadCompletionService as never,
    fileUrlService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    applicationRegistrationRepository.existsBy.mockResolvedValue(true);
  });

  describe('completeFileUpload', () => {
    const complete = () =>
      service.completeFileUpload({
        applicationRegistrationId: REGISTRATION_ID,
        uploaderWorkspaceId: WORKSPACE_ID,
        fileId: UPLOAD_FILE_ID,
      });

    it('should inspect the upload, copy it to the registration storage and drop the upload', async () => {
      fileRepository.findOne.mockResolvedValue(buildUpload());
      serverFileStorageService.writeServerFile.mockImplementation(
        async ({ fileId, resourcePath }) =>
          buildServerFile({
            id: fileId,
            path: `${ServerFileFolder.ApplicationRegistrationVariable}/${REGISTRATION_ID}/${resourcePath}`,
          }),
      );

      const completedFile = await complete();

      expect(
        fileUploadCompletionService.completeUploadedFile,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          storageLocation: expect.objectContaining({
            fileFolder: FileFolder.ApplicationRegistrationVariableUpload,
            applicationUniversalIdentifier: 'custom-app',
            resourcePath: `${UPLOAD_FILE_ID}.png`,
          }),
        }),
      );
      expect(serverFileStorageService.writeServerFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
          applicationRegistrationId: REGISTRATION_ID,
          resourcePath: `${completedFile.id}.png`,
          mimeType: 'image/png',
          settings: { isTemporaryFile: true, toDelete: false },
        }),
      );
      expect(completedFile).toMatchObject({
        path: `${ServerFileFolder.ApplicationRegistrationVariable}/${REGISTRATION_ID}/${completedFile.id}.png`,
        url: `https://signed/${completedFile.id}`,
      });
      expect(fileStorageService.deleteByFileId).toHaveBeenCalledWith({
        fileId: UPLOAD_FILE_ID,
        workspaceId: WORKSPACE_ID,
        fileFolder: FileFolder.ApplicationRegistrationVariableUpload,
      });
    });

    it('should not inspect again an upload already completed', async () => {
      fileRepository.findOne.mockResolvedValue(
        buildUpload({ status: FILE_STATUS.UPLOADED, mimeType: 'image/png' }),
      );
      serverFileStorageService.writeServerFile.mockResolvedValue(
        buildServerFile(),
      );

      await complete();

      expect(
        fileUploadCompletionService.completeUploadedFile,
      ).not.toHaveBeenCalled();
      expect(serverFileStorageService.writeServerFile).toHaveBeenCalledWith(
        expect.objectContaining({ mimeType: 'image/png' }),
      );
    });

    it('should keep the upload when its inspection fails', async () => {
      fileRepository.findOne.mockResolvedValue(buildUpload());
      fileUploadCompletionService.completeUploadedFile.mockRejectedValueOnce(
        new Error('not uploaded yet'),
      );

      await expect(complete()).rejects.toThrow('not uploaded yet');

      expect(serverFileStorageService.writeServerFile).not.toHaveBeenCalled();
      expect(fileStorageService.deleteByFileId).not.toHaveBeenCalled();
    });

    it('should refuse an unknown upload', async () => {
      fileRepository.findOne.mockResolvedValue(null);

      await expect(complete()).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.VARIABLE_FILE_UPLOAD_NOT_FOUND,
      });
    });

    it('should refuse an unknown registration', async () => {
      applicationRegistrationRepository.existsBy.mockResolvedValue(false);

      await expect(complete()).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      });
      expect(fileRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('signFilesValue', () => {
    it('should add a permanent url to every file when urls are not signed', async () => {
      const signedValue = await service.signFilesValue({
        plaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png', extension: '.png' },
        ]),
        applicationRegistrationId: REGISTRATION_ID,
        signUrl: false,
      });

      expect(JSON.parse(signedValue)).toEqual([
        {
          fileId: LOGO_FILE_ID,
          label: 'logo.png',
          extension: '.png',
          url: `https://signed/${LOGO_FILE_ID}`,
        },
      ]);
      expect(fileUrlService.signServerFileByIdUrl).toHaveBeenCalledWith({
        fileId: LOGO_FILE_ID,
        applicationRegistrationId: REGISTRATION_ID,
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        isPermanent: true,
      });
    });

    it('should sign an expiring url when the variable signs its urls', async () => {
      await service.signFilesValue({
        plaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'certificate.pem' },
        ]),
        applicationRegistrationId: REGISTRATION_ID,
        signUrl: true,
      });

      expect(fileUrlService.signServerFileByIdUrl).toHaveBeenCalledWith(
        expect.objectContaining({ fileId: LOGO_FILE_ID, isPermanent: false }),
      );
    });

    it('should read a value without file as empty', async () => {
      await expect(
        service.signFilesValue({
          plaintextValue: '',
          applicationRegistrationId: REGISTRATION_ID,
          signUrl: false,
        }),
      ).resolves.toBe('');
    });
  });

  describe('prepareFilesValueUpdate', () => {
    const prepare = ({
      previousPlaintextValue = '',
      nextPlaintextValue,
    }: {
      previousPlaintextValue?: string;
      nextPlaintextValue: string;
    }) =>
      service.prepareFilesValueUpdate({
        applicationRegistrationId: REGISTRATION_ID,
        previousPlaintextValue,
        nextPlaintextValue,
      });

    it('should bind a completed upload and store it without its signed url', async () => {
      serverFileStorageService.findServerFilesByIds.mockResolvedValue([
        buildServerFile(),
      ]);

      const update = await prepare({
        nextPlaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png', url: 'https://signed' },
        ]),
      });

      expect(update).toEqual({
        plaintextValueToStore: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png', extension: '.png' },
        ]),
        fileIdsToBind: [LOGO_FILE_ID],
        fileIdsToDelete: [],
      });
      expect(
        serverFileStorageService.findServerFilesByIds,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileIds: [LOGO_FILE_ID],
      });
    });

    it('should keep an already bound file and drop the one no longer listed', async () => {
      serverFileStorageService.findServerFilesByIds.mockResolvedValue([]);

      const update = await prepare({
        previousPlaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png', extension: '.png' },
          { fileId: OLD_LOGO_FILE_ID, label: 'old.png', extension: '.png' },
        ]),
        nextPlaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'renamed.png' },
        ]),
      });

      expect(update).toEqual({
        plaintextValueToStore: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'renamed.png', extension: '.png' },
        ]),
        fileIdsToBind: [],
        fileIdsToDelete: [OLD_LOGO_FILE_ID],
      });
    });

    it.each([
      ['malformed JSON', '{'],
      ['a list of non-files', JSON.stringify(['logo.png'])],
    ])('should refuse %s', async (_title, nextPlaintextValue) => {
      await expect(prepare({ nextPlaintextValue })).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.INVALID_INPUT,
      });
    });

    it.each([
      ['a file of another registration', []],
      [
        'a file already bound elsewhere',
        [
          buildServerFile({
            settings: { isTemporaryFile: false, toDelete: false },
          }),
        ],
      ],
    ])('should refuse binding %s', async (_title, serverFiles) => {
      serverFileStorageService.findServerFilesByIds.mockResolvedValue(
        serverFiles,
      );

      await expect(
        prepare({
          nextPlaintextValue: JSON.stringify([
            { fileId: LOGO_FILE_ID, label: 'logo.png' },
          ]),
        }),
      ).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.INVALID_INPUT,
      });
    });
  });

  describe('applyFilesValueUpdate', () => {
    it('should make bound files permanent and delete the dropped ones', async () => {
      await service.applyFilesValueUpdate({
        applicationRegistrationId: REGISTRATION_ID,
        fileIdsToBind: [LOGO_FILE_ID],
        fileIdsToDelete: [OLD_LOGO_FILE_ID],
      });

      expect(
        serverFileStorageService.updateServerFilesSettings,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileIds: [LOGO_FILE_ID],
        settings: { isTemporaryFile: false, toDelete: false },
      });
      expect(
        serverFileStorageService.deleteServerFileById,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileId: OLD_LOGO_FILE_ID,
      });
    });

    it('should keep the update when a dropped file cannot be deleted', async () => {
      serverFileStorageService.deleteServerFileById.mockRejectedValueOnce(
        new Error('storage down'),
      );

      await expect(
        service.applyFilesValueUpdate({
          applicationRegistrationId: REGISTRATION_ID,
          fileIdsToBind: [],
          fileIdsToDelete: [OLD_LOGO_FILE_ID],
        }),
      ).resolves.toBeUndefined();
    });
  });
});
