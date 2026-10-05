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
    writeServerFileFromStream: jest.fn(),
    findServerFilesByIds: jest.fn(),
    claimTemporaryServerFiles: jest.fn(),
    deleteServerFileRowsByIds: jest.fn(),
    deleteServerFileBytes: jest.fn(),
  };
  const entityManager = { transactional: true } as never;
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
    serverFileStorageService.deleteServerFileRowsByIds.mockResolvedValue([]);
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
      serverFileStorageService.writeServerFileFromStream.mockImplementation(
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
      expect(
        serverFileStorageService.writeServerFileFromStream,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
          applicationRegistrationId: REGISTRATION_ID,
          resourcePath: `${completedFile.id}.png`,
          stream: expect.any(Readable),
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

    it('should drop the copied file when its url cannot be signed', async () => {
      fileRepository.findOne.mockResolvedValue(buildUpload());
      serverFileStorageService.writeServerFileFromStream.mockResolvedValue(
        buildServerFile(),
      );
      serverFileStorageService.deleteServerFileRowsByIds.mockResolvedValue([
        buildServerFile(),
      ]);
      fileUrlService.signServerFileByIdUrl.mockRejectedValueOnce(
        new Error('signing key unavailable'),
      );

      await expect(complete()).rejects.toThrow('signing key unavailable');

      expect(
        serverFileStorageService.deleteServerFileRowsByIds,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileIds: [LOGO_FILE_ID],
      });
      expect(
        serverFileStorageService.deleteServerFileBytes,
      ).toHaveBeenCalledWith([expect.objectContaining({ id: LOGO_FILE_ID })]);
      expect(fileStorageService.deleteByFileId).toHaveBeenCalledWith(
        expect.objectContaining({ fileId: UPLOAD_FILE_ID }),
      );
    });

    it('should not inspect again an upload already completed', async () => {
      fileRepository.findOne.mockResolvedValue(
        buildUpload({ status: FILE_STATUS.UPLOADED, mimeType: 'image/png' }),
      );
      serverFileStorageService.writeServerFileFromStream.mockResolvedValue(
        buildServerFile(),
      );

      await complete();

      expect(
        fileUploadCompletionService.completeUploadedFile,
      ).not.toHaveBeenCalled();
      expect(
        serverFileStorageService.writeServerFileFromStream,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ mimeType: 'image/png' }),
      );
    });

    it('should keep the upload when its inspection fails', async () => {
      fileRepository.findOne.mockResolvedValue(buildUpload());
      fileUploadCompletionService.completeUploadedFile.mockRejectedValueOnce(
        new Error('not uploaded yet'),
      );

      await expect(complete()).rejects.toThrow('not uploaded yet');

      expect(
        serverFileStorageService.writeServerFileFromStream,
      ).not.toHaveBeenCalled();
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
    it('should claim the bound files and drop the rows of the removed ones in the transaction', async () => {
      serverFileStorageService.claimTemporaryServerFiles.mockResolvedValue(1);
      const droppedFile = buildServerFile({ id: OLD_LOGO_FILE_ID });

      serverFileStorageService.deleteServerFileRowsByIds.mockResolvedValue([
        droppedFile,
      ]);

      const droppedFiles = await service.applyFilesValueUpdate({
        entityManager,
        applicationRegistrationId: REGISTRATION_ID,
        fileIdsToBind: [LOGO_FILE_ID],
        fileIdsToDelete: [OLD_LOGO_FILE_ID],
      });

      expect(
        serverFileStorageService.claimTemporaryServerFiles,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileIds: [LOGO_FILE_ID],
        entityManager,
      });
      expect(
        serverFileStorageService.deleteServerFileRowsByIds,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileIds: [OLD_LOGO_FILE_ID],
        entityManager,
      });
      expect(droppedFiles).toEqual([droppedFile]);
    });

    it('should refuse the update when a file was bound by a concurrent save', async () => {
      serverFileStorageService.claimTemporaryServerFiles.mockResolvedValue(0);

      await expect(
        service.applyFilesValueUpdate({
          entityManager,
          applicationRegistrationId: REGISTRATION_ID,
          fileIdsToBind: [LOGO_FILE_ID],
          fileIdsToDelete: [],
        }),
      ).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.INVALID_INPUT,
      });

      expect(
        serverFileStorageService.deleteServerFileRowsByIds,
      ).not.toHaveBeenCalled();
    });
  });

  describe('deleteFilesOfValue', () => {
    it('should drop the rows and bytes of every file of the value', async () => {
      const droppedFile = buildServerFile();

      serverFileStorageService.deleteServerFileRowsByIds.mockResolvedValue([
        droppedFile,
      ]);

      await service.deleteFilesOfValue({
        applicationRegistrationId: REGISTRATION_ID,
        plaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png' },
        ]),
        entityManager,
      });

      expect(
        serverFileStorageService.deleteServerFileRowsByIds,
      ).toHaveBeenCalledWith({
        fileFolder: ServerFileFolder.ApplicationRegistrationVariable,
        applicationRegistrationId: REGISTRATION_ID,
        fileIds: [LOGO_FILE_ID],
        entityManager,
      });
      expect(
        serverFileStorageService.deleteServerFileBytes,
      ).toHaveBeenCalledWith([droppedFile]);
    });
  });
});
