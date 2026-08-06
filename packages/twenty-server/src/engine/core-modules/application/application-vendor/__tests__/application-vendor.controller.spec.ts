import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Response } from 'express';
import { Readable, Writable } from 'stream';

import { ApplicationVendorController } from 'src/engine/core-modules/application/application-vendor/application-vendor.controller';
import { ApplicationVendorService } from 'src/engine/core-modules/application/application-vendor/application-vendor.service';
import {
  APPLICATION_VENDOR_CACHE_CONTROL,
  APPLICATION_VENDOR_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/application/application-vendor/constants/application-vendor-cache-control.constant';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { PRESIGNED_URL_NO_STORE_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const WORKSPACE_ID = 'workspace-1';
const APPLICATION_ID = 'application-1';
const VENDOR_CHECKSUM = 'a'.repeat(64);
const VENDOR_BUNDLE_CONTENT = 'export const vendor = 1;';

const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;

describe('ApplicationVendorController', () => {
  let controller: ApplicationVendorController;
  let applicationVendorService: jest.Mocked<
    Pick<ApplicationVendorService, 'getBuiltVendorPresignedUrlOrStream'>
  >;
  let response: Response & {
    setHeader: jest.Mock;
    json: jest.Mock;
  };
  let writtenChunks: string[];

  const buildStreamResponse = () => ({
    fileResponse: {
      type: 'stream' as const,
      stream: Readable.from([VENDOR_BUNDLE_CONTENT]),
      mimeType: 'application/javascript',
    },
    vendorChecksum: VENDOR_CHECKSUM,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    applicationVendorService = {
      getBuiltVendorPresignedUrlOrStream: jest.fn(),
    };

    writtenChunks = [];

    response = Object.assign(
      new Writable({
        write: (chunk, _encoding, callback) => {
          writtenChunks.push(String(chunk));
          callback();
        },
      }),
      {
        setHeader: jest.fn(),
        json: jest.fn(),
      },
    ) as unknown as Response & { setHeader: jest.Mock; json: jest.Mock };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationVendorController],
      providers: [
        {
          provide: ApplicationVendorService,
          useValue: applicationVendorService,
        },
      ],
    }).compile();

    controller = module.get(ApplicationVendorController);
  });

  it('serves an immutable response when the requested checksum matches', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockResolvedValue(
      buildStreamResponse(),
    );

    await controller.getBuiltVendor(
      response,
      APPLICATION_ID,
      workspace,
      `${VENDOR_CHECKSUM}.js`,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      APPLICATION_VENDOR_CACHE_CONTROL,
    );
    expect(writtenChunks.join('')).toBe(VENDOR_BUNDLE_CONTENT);
  });

  it('refuses to cache a response requested with a stale checksum', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockResolvedValue(
      buildStreamResponse(),
    );

    await controller.getBuiltVendor(
      response,
      APPLICATION_ID,
      workspace,
      `${'b'.repeat(64)}.js`,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      APPLICATION_VENDOR_NO_STORE_CACHE_CONTROL,
    );
  });

  it('refuses to cache a response requested without a checksum', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockResolvedValue(
      buildStreamResponse(),
    );

    await controller.getBuiltVendor(response, APPLICATION_ID, workspace);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      APPLICATION_VENDOR_NO_STORE_CACHE_CONTROL,
    );
  });

  it('hands the presigned url over without storing it', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockResolvedValue(
      {
        fileResponse: {
          type: 'redirect',
          presignedUrl: 'https://storage.twenty.test/vendor.mjs?signature',
        },
        vendorChecksum: VENDOR_CHECKSUM,
      },
    );

    await controller.getBuiltVendor(
      response,
      APPLICATION_ID,
      workspace,
      `${VENDOR_CHECKSUM}.js`,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      PRESIGNED_URL_NO_STORE_CACHE_CONTROL,
    );
    expect(response.json).toHaveBeenCalledWith({
      url: 'https://storage.twenty.test/vendor.mjs?signature',
    });
  });

  it('answers with a not found error when the application declares no vendor', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockRejectedValue(
      new ApplicationException(
        'Application "application-1" does not declare a vendor bundle',
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      ),
    );

    await expect(
      controller.getBuiltVendor(response, APPLICATION_ID, workspace),
    ).rejects.toThrow(
      `Application "${APPLICATION_ID}" does not declare a vendor bundle`,
    );
  });

  it('answers with a not found error when the application does not exist', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockRejectedValue(
      new ApplicationException(
        'Application with id application-1 not found',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      ),
    );

    await expect(
      controller.getBuiltVendor(response, APPLICATION_ID, workspace),
    ).rejects.toThrow(NotFoundException);
  });

  it('does not leak the underlying failure of an unexpected error', async () => {
    applicationVendorService.getBuiltVendorPresignedUrlOrStream.mockRejectedValue(
      new Error('invalid input syntax for type uuid'),
    );

    await expect(
      controller.getBuiltVendor(response, APPLICATION_ID, workspace),
    ).rejects.toThrow(
      `Vendor bundle not found for application "${APPLICATION_ID}"`,
    );
  });
});
