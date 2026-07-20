import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { DpaRegionService } from 'src/engine/core-modules/dpa/services/dpa-region.service';
import { DpaService } from 'src/engine/core-modules/dpa/services/dpa.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// @react-pdf/renderer (via the PDF util) is ESM-only and jest can't parse it;
// mock the util so importing DpaService doesn't load it.
jest.mock('src/engine/core-modules/dpa/pdf/render-dpa-to-pdf.util', () => ({
  renderDpaToPdfBuffer: jest.fn(),
}));

describe('DpaService', () => {
  let service: DpaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DpaService,
        {
          provide: getRepositoryToken(DpaAgreementEntity),
          useValue: { find: jest.fn(), save: jest.fn() },
        },
        {
          provide: DpaRegionService,
          useValue: { getRegionForWorkspace: jest.fn() },
        },
        { provide: FileStorageService, useValue: { writeFile: jest.fn() } },
        { provide: FileUrlService, useValue: { signFileByIdUrl: jest.fn() } },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(false) },
        },
      ],
    }).compile();

    service = module.get<DpaService>(DpaService);
  });

  it('refuses to generate a signed DPA on self-hosted deployments', async () => {
    const generate = service.generateSignedDpa({
      workspace: { id: 'ws-1' },
      userId: 'user-1',
      userEmail: 'admin@example.com',
      input: {
        customerLegalEntityName: 'Acme GmbH',
        signatoryName: 'Jane Doe',
        signatoryTitle: 'Head of Legal',
      },
    });

    await expect(generate).rejects.toBeInstanceOf(BadRequestException);
    await expect(generate).rejects.toThrow(/self-hosted deployments/i);
  });
});
