import { Test, type TestingModule } from '@nestjs/testing';

import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CompanyEnrichmentResolver } from 'src/engine/core-modules/company-enrichment/resolvers/company-enrichment.resolver';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PersonEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/person-enrichment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('CompanyEnrichmentResolver', () => {
  let resolver: CompanyEnrichmentResolver;
  let companyEnrichmentService: { enrichCompanyForWorkspaceCreator: jest.Mock };
  let personEnrichmentService: { enrichPersonForWorkspaceCreator: jest.Mock };
  let onboardingService: {
    setOnboardingBookCallPendingIfQualified: jest.Mock;
    isOnboardingBookCallPending: jest.Mock;
  };

  const user = { id: 'user-id', email: 'foo@acme.com' } as AuthContextUser;
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  beforeEach(async () => {
    companyEnrichmentService = {
      enrichCompanyForWorkspaceCreator: jest.fn(),
    };
    personEnrichmentService = {
      enrichPersonForWorkspaceCreator: jest
        .fn()
        .mockResolvedValue({ outcome: 'unavailable', enrichment: null }),
    };
    onboardingService = {
      setOnboardingBookCallPendingIfQualified: jest.fn(),
      isOnboardingBookCallPending: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyEnrichmentResolver,
        {
          provide: CompanyEnrichmentService,
          useValue: companyEnrichmentService,
        },
        {
          provide: PersonEnrichmentService,
          useValue: personEnrichmentService,
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

  it('should report the stored pending flag rather than whether this call flagged it', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      { outcome: 'transientError', enrichment: null },
    );
    onboardingService.isOnboardingBookCallPending.mockResolvedValue(true);

    const result = await resolver.enrichWorkspaceCompany(user, workspace);

    expect(result.isBookCallOnboardingStepPending).toBe(true);
  });

  it('should report no pending step when the user has none', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      {
        outcome: 'matched',
        enrichment: { domain: 'acme.com', employeeCount: 2 },
      },
    );

    const result = await resolver.enrichWorkspaceCompany(user, workspace);

    expect(result.isBookCallOnboardingStepPending).toBe(false);
  });

  it('should enrich the person alongside the company with the signup email', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      { outcome: 'unavailable', enrichment: null },
    );
    personEnrichmentService.enrichPersonForWorkspaceCreator.mockResolvedValue({
      outcome: 'matched',
      enrichment: { email: 'foo@acme.com', fullName: 'Ada Lovelace' },
    });

    const result = await resolver.enrichWorkspaceCompany(user, workspace);

    expect(
      personEnrichmentService.enrichPersonForWorkspaceCreator,
    ).toHaveBeenCalledWith({
      userId: user.id,
      email: user.email,
      workspaceId: workspace.id,
    });
    expect(result.personOutcome).toBe('matched');
    expect(result.personEnrichment).toEqual({
      email: 'foo@acme.com',
      fullName: 'Ada Lovelace',
    });
  });

  it('should still return the company result when person enrichment rejects', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      {
        outcome: 'matched',
        enrichment: { domain: 'acme.com', employeeCount: 320 },
      },
    );
    personEnrichmentService.enrichPersonForWorkspaceCreator.mockRejectedValue(
      new Error('redis down'),
    );

    const result = await resolver.enrichWorkspaceCompany(user, workspace);

    expect(result.outcome).toBe('matched');
    expect(result.personOutcome).toBe('transientError');
    expect(result.personEnrichment).toBeNull();
  });

  it('should never qualify the book-call step from the person outcome', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      { outcome: 'unavailable', enrichment: null },
    );
    personEnrichmentService.enrichPersonForWorkspaceCreator.mockResolvedValue({
      outcome: 'matched',
      enrichment: { email: 'foo@acme.com' },
    });

    await resolver.enrichWorkspaceCompany(user, workspace);

    expect(
      onboardingService.setOnboardingBookCallPendingIfQualified,
    ).not.toHaveBeenCalled();
  });
});
