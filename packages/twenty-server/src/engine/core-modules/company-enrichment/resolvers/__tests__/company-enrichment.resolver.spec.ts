import { Test, type TestingModule } from '@nestjs/testing';

import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CompanyEnrichmentResolver } from 'src/engine/core-modules/company-enrichment/resolvers/company-enrichment.resolver';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PersonEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/person-enrichment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AccessPolicyService } from 'src/engine/guards/access-policy/access-policy.service';

describe('CompanyEnrichmentResolver', () => {
  let resolver: CompanyEnrichmentResolver;
  let companyEnrichmentService: { enrichCompanyForWorkspaceCreator: jest.Mock };
  let personEnrichmentService: { enrichPersonForWorkspaceCreator: jest.Mock };
  let onboardingService: {
    creditEnrichmentQualificationReward: jest.Mock;
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
      creditEnrichmentQualificationReward: jest.fn(),
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
        { provide: AccessPolicyService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<CompanyEnrichmentResolver>(CompanyEnrichmentResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hand the enriched employee count to the credit reward on a match', async () => {
    companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
      {
        outcome: 'matched',
        enrichment: { domain: 'acme.com', employeeCount: 320 },
      },
    );

    await resolver.enrichWorkspaceCompany(user, workspace);

    expect(
      onboardingService.creditEnrichmentQualificationReward,
    ).toHaveBeenCalledTimes(1);
    expect(
      onboardingService.creditEnrichmentQualificationReward,
    ).toHaveBeenCalledWith({
      workspaceId: workspace.id,
      employeeCount: 320,
    });
  });

  it.each(['unavailable', 'transientError'])(
    'should not credit the enrichment reward on outcome %s',
    async (outcome) => {
      companyEnrichmentService.enrichCompanyForWorkspaceCreator.mockResolvedValue(
        { outcome, enrichment: null },
      );

      await resolver.enrichWorkspaceCompany(user, workspace);

      expect(
        onboardingService.creditEnrichmentQualificationReward,
      ).not.toHaveBeenCalled();
    },
  );

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
});
