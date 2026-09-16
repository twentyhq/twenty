/* @license Enterprise */

// oxlint-disable twenty/rest-api-methods-should-be-guarded
import {
  Catch,
  Controller,
  Get,
  Injectable,
  type ArgumentsHost,
  type CanActivate,
  type ExceptionFilter,
  type ExecutionContext,
  type INestApplication,
  type MiddlewareConsumer,
  Module,
  NestModule,
  type NestMiddleware,
  Post,
  UseGuards,
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
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspacePlanRequiredGuard } from 'src/engine/guards/workspace-plan-required.guard';

/**
 * Simulates JwtAuthGuard / McpAuthGuard: binds workspace AFTER APP_GUARD.
 */
@Injectable()
class BindWorkspaceAfterAppGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      workspace?: { id: string };
    }>();
    const header = req.headers['x-workspace-id'];
    const workspaceId = Array.isArray(header) ? header[0] : header;

    if (workspaceId) {
      req.workspace = { id: workspaceId };
    }

    return true;
  }
}

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

/**
 * MCP-like: no middleware hydration — APP_GUARD alone would early-return.
 */
@Controller('mcp')
@UseGuards(BindWorkspaceAfterAppGuard, WorkspacePlanRequiredGuard)
class McpLikeController {
  @Post()
  handle() {
    return { ok: true };
  }
}

/**
 * App/apps Jwt-only product path: same late bind pattern.
 */
@Controller('app/billing')
@UseGuards(BindWorkspaceAfterAppGuard, WorkspacePlanRequiredGuard)
class AppBillingLikeController {
  @Get('credits')
  credits() {
    return { ok: true };
  }
}

@Injectable()
class NoopMiddleware implements NestMiddleware {
  use(_req: unknown, _res: unknown, next: () => void) {
    next();
  }
}

@Module({
  controllers: [McpLikeController, AppBillingLikeController],
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
    BindWorkspaceAfterAppGuard,
  ],
})
class JwtAfterAppGuardHarnessModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Intentionally does not attach workspace (proves APP_GUARD early-return).
    consumer.apply(NoopMiddleware).forRoutes('{*path}');
  }
}

describe('Jwt-after-APP_GUARD plan gate harness', () => {
  let app: INestApplication;
  let assertWorkspaceHasRequiredPlan: jest.Mock;
  let getConfig: jest.Mock;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtAfterAppGuardHarnessModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    assertWorkspaceHasRequiredPlan = moduleFixture.get(BillingService)
      .assertWorkspaceHasRequiredPlan as jest.Mock;
    getConfig = moduleFixture.get(TwentyConfigService).get as jest.Mock;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    getConfig.mockReset();
    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return true;
      }

      return false;
    });
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);
  });

  it('denies unpaid MCP-like POST when flag on (after Jwt bind)', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const res = await request(app.getHttpServer())
      .post('/mcp')
      .set('x-workspace-id', 'ws-unpaid')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });

    expect(res.status).toBe(402);
    expect(res.body.code).toBe(BillingExceptionCode.BILLING_PLAN_REQUIRED);
    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-unpaid');
  });

  it('denies unpaid app/billing product path when flag on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const res = await request(app.getHttpServer())
      .get('/app/billing/credits')
      .set('x-workspace-id', 'ws-unpaid');

    expect(res.status).toBe(402);
    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-unpaid');
  });

  it('allows MCP-like when assert resolves (paid)', async () => {
    const res = await request(app.getHttpServer())
      .post('/mcp')
      .set('x-workspace-id', 'ws-paid')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-paid');
  });

  it('skips assert when flag off even after Jwt bind', async () => {
    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return false;
      }

      return false;
    });
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const res = await request(app.getHttpServer())
      .post('/mcp')
      .set('x-workspace-id', 'ws-unpaid')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });

    expect(res.status).toBe(201);
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });
});
