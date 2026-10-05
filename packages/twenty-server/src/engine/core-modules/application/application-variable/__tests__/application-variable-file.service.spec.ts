import { FileFolder } from 'twenty-shared/types';

import { ApplicationVariableFileService } from 'src/engine/core-modules/application/application-variable/application-variable-file.service';
import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000002';
const LOGO_FILE_ID = '20202020-0000-4000-8000-000000000003';
const OLD_LOGO_FILE_ID = '20202020-0000-4000-8000-000000000004';

const buildUploadedFile = (overrides: Partial<FileEntity> = {}): FileEntity =>
  ({
    id: LOGO_FILE_ID,
    workspaceId: WORKSPACE_ID,
    applicationId: APPLICATION_ID,
    path: `${FileFolder.ApplicationVariable}/${LOGO_FILE_ID}.png`,
    status: FILE_STATUS.UPLOADED,
    settings: { isTemporaryFile: true, toDelete: false },
    ...overrides,
  }) as FileEntity;

describe('ApplicationVariableFileService', () => {
  const fileRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };
  const fileStorageService = { deleteByFileId: jest.fn() };
  const fileUrlService = {
    signFileByIdUrl: jest.fn(
      async ({ fileId }: { fileId: string }) => `https://signed/${fileId}`,
    ),
  };

  const service = new ApplicationVariableFileService(
    fileRepository as never,
    fileStorageService as never,
    fileUrlService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signFilesValue', () => {
    it('should add a permanent url to every file when urls are not signed', async () => {
      const signedValue = await service.signFilesValue({
        plaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png', extension: '.png' },
        ]),
        workspaceId: WORKSPACE_ID,
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
      expect(fileUrlService.signFileByIdUrl).toHaveBeenCalledWith({
        fileId: LOGO_FILE_ID,
        workspaceId: WORKSPACE_ID,
        fileFolder: FileFolder.ApplicationVariable,
        isPermanent: true,
      });
    });

    it('should sign an expiring url when the variable signs its urls', async () => {
      await service.signFilesValue({
        plaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'contract.pdf', extension: '.pdf' },
        ]),
        workspaceId: WORKSPACE_ID,
        signUrl: true,
      });

      expect(fileUrlService.signFileByIdUrl).toHaveBeenCalledWith(
        expect.objectContaining({ fileId: LOGO_FILE_ID, isPermanent: false }),
      );
    });

    it('should read a value without file as empty', async () => {
      await expect(
        service.signFilesValue({
          plaintextValue: '',
          workspaceId: WORKSPACE_ID,
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
        applicationId: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        previousPlaintextValue,
        nextPlaintextValue,
      });

    it('should bind a completed upload and store it without its signed url', async () => {
      fileRepository.find.mockResolvedValue([buildUploadedFile()]);

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
    });

    it('should keep an already bound file and drop the one no longer listed', async () => {
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
      expect(fileRepository.find).not.toHaveBeenCalled();
    });

    it('should store an emptied list as an empty value', async () => {
      const update = await prepare({
        previousPlaintextValue: JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png', extension: '.png' },
        ]),
        nextPlaintextValue: '[]',
      });

      expect(update).toEqual({
        plaintextValueToStore: '',
        fileIdsToBind: [],
        fileIdsToDelete: [LOGO_FILE_ID],
      });
    });

    it.each([
      ['malformed JSON', '{'],
      ['a scalar', '"logo.png"'],
      ['a list of non-files', JSON.stringify(['logo.png'])],
      [
        'a duplicated file',
        JSON.stringify([
          { fileId: LOGO_FILE_ID, label: 'logo.png' },
          { fileId: LOGO_FILE_ID, label: 'logo.png' },
        ]),
      ],
    ])('should refuse %s', async (_title, nextPlaintextValue) => {
      await expect(prepare({ nextPlaintextValue })).rejects.toMatchObject({
        code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      });
    });

    it.each([
      ['an unknown file', []],
      [
        'a file of another application',
        [buildUploadedFile({ applicationId: 'other-application' })],
      ],
      [
        'a file uploaded for a files field',
        [buildUploadedFile({ path: `${FileFolder.FilesField}/x/y.png` })],
      ],
      [
        'an upload that was not completed',
        [buildUploadedFile({ status: FILE_STATUS.PENDING })],
      ],
      [
        'a file already bound elsewhere',
        [
          buildUploadedFile({
            settings: { isTemporaryFile: false, toDelete: false },
          }),
        ],
      ],
    ])('should refuse binding %s', async (_title, foundFiles) => {
      fileRepository.find.mockResolvedValue(foundFiles);

      await expect(
        prepare({
          nextPlaintextValue: JSON.stringify([
            { fileId: LOGO_FILE_ID, label: 'logo.png' },
          ]),
        }),
      ).rejects.toMatchObject({
        code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      });
    });
  });

  describe('applyFilesValueUpdate', () => {
    it('should make bound files permanent and delete dropped ones', async () => {
      await service.applyFilesValueUpdate({
        fileIdsToBind: [LOGO_FILE_ID],
        fileIdsToDelete: [OLD_LOGO_FILE_ID],
        workspaceId: WORKSPACE_ID,
      });

      expect(fileRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: expect.anything() },
        { settings: { isTemporaryFile: false, toDelete: false } },
      );
      expect(fileStorageService.deleteByFileId).toHaveBeenCalledWith({
        fileId: OLD_LOGO_FILE_ID,
        workspaceId: WORKSPACE_ID,
        fileFolder: FileFolder.ApplicationVariable,
      });
    });

    it('should not fail the update when a dropped file is already gone', async () => {
      fileStorageService.deleteByFileId.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.applyFilesValueUpdate({
          fileIdsToBind: [],
          fileIdsToDelete: [OLD_LOGO_FILE_ID],
          workspaceId: WORKSPACE_ID,
        }),
      ).resolves.toBeUndefined();
    });
  });
});
