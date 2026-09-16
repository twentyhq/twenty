/* @license Enterprise */

// oxlint-disable twenty/rest-api-methods-should-be-guarded
import {
  Catch,
  Controller,
  Get,
  type ArgumentsHost,
  type ExceptionFilter,
  type INestApplication,
  type MiddlewareConsumer,
  Module,
  NestModule,
  type NestMiddleware,
  Injectable,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Response } from 'express';
import request from 'supertest';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { billingGraphqlApiExceptionHandler } from 'src/engine/core-modules/billing/utils/billing-graphql-api-exception-handler.util';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SkipPlanRequired } from 'src/engine/guards/decorators/skip-plan-required.decorator';
import { WorkspacePlanRequiredGuard } from 'src/engine/guards/workspace-plan-required.guard';

/**
 * Mirrors RestApiExceptionFilter + HttpExceptionHandlerService billing body shape
 * for BillingException without booting the full REST stack.
 */
@Catch(BillingException)
class PlanRequiredHttpExceptionFilter implements ExceptionFilter {
  catch(exception: BillingException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = exception.statusCode ?? 402;

    return response.status(statusCode).json({
      statusCode,
      error: exception.name,
      messages: [exception.message],
      code: exception.code,
    });
  }
}

@Injectable()
class AttachWorkspaceMiddleware implements NestMiddleware {
  use(
    req: {
      headers: Record<string, string | string[] | undefined>;
      workspace?: { id: string };
    },
    _res: unknown,
    next: () => void,
  ) {
    const header = req.headers['x-workspace-id'];
    const workspaceId = Array.isArray(header) ? header[0] : header;

    if (workspaceId) {
      req.workspace = { id: workspaceId };
    }

    next();
  }
}

@Controller()
class PlanRequiredHarnessController {
  @Get('rest/companies')
  companies() {
    return { data: { companies: [] } };
  }

  @SkipPlanRequired()
  @Get('graphql-allowlist/listPlans')
  listPlans() {
    return { data: { listPlans: [] } };
  }

  @SkipPlanRequired()
  @Get('graphql-allowlist/currentUser')
  currentUser() {
    return { data: { currentUser: { onboardingStatus: 'PLAN_REQUIRED' } } };
  }
}

@Module({
  controllers: [PlanRequiredHarnessController],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useClass: WorkspacePlanRequiredGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PlanRequiredHttpExceptionFilter,
    },
    {
      provide: TwentyConfigService,
      useValue: { get: jest.fn() },
    },
    {
      provide: BillingService,
      useValue: { assertWorkspaceHasRequiredPlan: jest.fn() },
    },
  ],
})
class PlanRequiredHarnessModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AttachWorkspaceMiddleware).forRoutes('{*path}');
  }
}

describe('WorkspacePlanRequiredGuard HTTP harness (Nest/supertest)', () => {
  let app: INestApplication;
  let getConfig: jest.Mock;
  let assertWorkspaceHasRequiredPlan: jest.Mock;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlanRequiredHarnessModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    getConfig = moduleFixture.get(TwentyConfigService).get as jest.Mock;
    assertWorkspaceHasRequiredPlan = moduleFixture.get(BillingService)
      .assertWorkspaceHasRequiredPlan as jest.Mock;

    getConfig.mockReset();
    assertWorkspaceHasRequiredPlan.mockReset();
    getConfig.mockReturnValue(true);
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 402 + BILLING_PLAN_REQUIRED for unpaid product REST when flag is on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/rest/companies')
      .set('x-workspace-id', 'ws-unpaid')
      .expect(402);

    expect(response.body.code).toBe(BillingExceptionCode.BILLING_PLAN_REQUIRED);
    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-unpaid');
  });

  it('allows listPlans allowlisted route for unpaid workspace when flag is on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/graphql-allowlist/listPlans')
      .set('x-workspace-id', 'ws-unpaid')
      .expect(200);

    expect(response.body.data.listPlans).toEqual([]);
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('allows currentUser bootstrap allowlisted route for unpaid workspace when flag is on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/graphql-allowlist/currentUser')
      .set('x-workspace-id', 'ws-unpaid')
      .expect(200);

    expect(response.body.data.currentUser.onboardingStatus).toBe(
      'PLAN_REQUIRED',
    );
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('allows companies when assertWorkspaceHasRequiredPlan resolves (paid)', async () => {
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);

    const response = await request(app.getHttpServer())
      .get('/rest/companies')
      .set('x-workspace-id', 'ws-paid')
      .expect(200);

    expect(response.body.data.companies).toEqual([]);
    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-paid');
  });

  it('allows companies for unpaid workspace when flag is off (dark)', async () => {
    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return false;
      }

      return true;
    });
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/rest/companies')
      .set('x-workspace-id', 'ws-unpaid')
      .expect(200);

    expect(response.body.data.companies).toEqual([]);
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('maps BILLING_PLAN_REQUIRED to GraphQL FORBIDDEN + subCode (same contract as integration)', () => {
    const exception = new BillingException(
      'Workspace subscription plan is required',
      BillingExceptionCode.BILLING_PLAN_REQUIRED,
    );

    try {
      billingGraphqlApiExceptionHandler(exception);
      throw new Error('Expected handler to throw');
    } catch (error) {
      expect(error).toMatchObject({
        extensions: {
          code: ErrorCode.FORBIDDEN,
          subCode: BillingExceptionCode.BILLING_PLAN_REQUIRED,
        },
      });
    }
  });
});
