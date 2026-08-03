import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('SubdomainManagerService', () => {
  let service: SubdomainManagerService;
  const takenSubdomains = new Set<string>();
  let areAllSubdomainsTaken = false;

  beforeEach(async () => {
    takenSubdomains.clear();
    areAllSubdomainsTaken = false;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubdomainManagerService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn((options: { where: { subdomain: string } }) =>
              Promise.resolve(
                areAllSubdomainsTaken ||
                  takenSubdomains.has(options.where.subdomain)
                  ? ({} as WorkspaceEntity)
                  : null,
              ),
            ),
            find: jest.fn(
              (options: { where: { subdomain: { value: string[] } } }) =>
                Promise.resolve(
                  options.where.subdomain.value
                    .filter(
                      (candidate) =>
                        areAllSubdomainsTaken || takenSubdomains.has(candidate),
                    )
                    .map((subdomain) => ({ subdomain }) as WorkspaceEntity),
                ),
            ),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('app'),
          },
        },
      ],
    }).compile();

    service = module.get(SubdomainManagerService);
  });

  describe('getSubdomainAvailability', () => {
    it('returns the input as the only suggestion when it is free', async () => {
      const result = await service.getSubdomainAvailability('stripe');

      expect(result.isValid).toBe(true);
      expect(result.available).toBe(true);
      expect(result.suggestedSubdomain).toBe('stripe');
      expect(result.suggestedSubdomains).toEqual(['stripe']);
    });

    it('returns three distinct available alternatives when taken', async () => {
      takenSubdomains.add('stripe');

      const result = await service.getSubdomainAvailability('stripe');

      expect(result.available).toBe(false);
      expect(result.suggestedSubdomains).toHaveLength(3);
      expect(new Set(result.suggestedSubdomains).size).toBe(3);
      expect(result.suggestedSubdomains).not.toContain('stripe');
      expect(result.suggestedSubdomain).toBe(result.suggestedSubdomains[0]);
      result.suggestedSubdomains.forEach((candidate) =>
        expect(takenSubdomains.has(candidate)).toBe(false),
      );
    });

    it('skips taken numbered suffixes when collecting alternatives', async () => {
      takenSubdomains.add('stripe');
      takenSubdomains.add('stripe-2');

      const result = await service.getSubdomainAvailability('stripe');

      expect(result.suggestedSubdomains).toEqual([
        'stripe-3',
        'stripe-4',
        'stripe-5',
      ]);
    });
  });

  describe('findAvailableSubdomains', () => {
    it('returns the requested number of distinct available subdomains', async () => {
      takenSubdomains.add('acme');

      const subdomains = await service.findAvailableSubdomains('acme', 3);

      expect(subdomains).toHaveLength(3);
      expect(new Set(subdomains).size).toBe(3);
      subdomains.forEach((candidate) =>
        expect(takenSubdomains.has(candidate)).toBe(false),
      );
    });

    it('does not pad with unverified subdomains when availability is scarce', async () => {
      areAllSubdomainsTaken = true;

      const subdomains = await service.findAvailableSubdomains('acme', 3);

      expect(subdomains).toHaveLength(1);
    });
  });
});
