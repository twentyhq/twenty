import { Test, type TestingModule } from '@nestjs/testing';

import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CompanyEnrichmentResolver } from 'src/engine/core-modules/company-enrichment/resolvers/company-enrichment.resolver';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('CompanyEnrichmentResolver', () => {
  let resolver: CompanyEnrichmentResolver;
  let companyEnrichmentService: { enrichCompanyForWorkspaceCreator: jest.Mock };
  let onboardingService: { setOnboardingBookCallPendingIfQualified: jest.Mock };

  const user = { id: 'user-id', email: 'foo@acme.com' } as AuthContextUser;
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  beforeEach(async () => {
    companyEnrichmentService = {
      enrichCompanyForWorkspaceCreator: jest.fn(),
    };
    onboardingService = {
      setOnboardingBookCallPendingIfQualified: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyEnrichmentResolver,
        {
          provide: CompanyEnrichmentService,
          useValue: companyEnrichmentService,
        },
        {
          provide: OnboardingService,
          useValue: onboardingService,
        },
      ],
    }).compile();

    resolver = module.get<CompanyEnrichmentResolver>(CompanyEnrichmentResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hand the enriched employee count to the book-call qualification on a match', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      {
        outcome: 'matched',
        enrichment: { domain: 'acme.com', employeeCount: 320 },
      },
    );

    const result = await resolver.enrichWorkspaceCompany(user, workspace);

    expect(result.outcome).toBe('matched');
    expect(
      onboardingService.setOnboardingBookCallPendingIfQualified,
    ).toHaveBeenCalledWith({
      userId: user.id,
      workspaceId: workspace.id,
      employeeCount: 320,
    });
  });

  it.each(['unavailable', 'transientError'])(
    'should not qualify for the book-call step on outcome %s',
    async (outcome) => {
      companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
        { outcome, enrichment: null },
      );

      await resolver.enrichWorkspaceCompany(user, workspace);

      expect(
        onboardingService.setOnboardingBookCallPendingIfQualified,
      ).not.toHaveBeenCalled();
    },
  );
});
