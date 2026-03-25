import { type NextFunction, type Request, type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

import { WorkspaceAuthContextMiddleware } from '../workspace-auth-context.middleware';

const mockWorkspace = {
  id: 'workspace-id',
  displayName: 'Test Workspace',
} as Request['workspace'];

const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
} as Request['user'];

const mockApplication = {
  id: 'application-id',
  name: 'Test App',
  defaultRoleId: 'app-role-id',
} as Request['application'];

const mockApiKey = {
  id: 'api-key-id',
  name: 'Test API Key',
} as Request['apiKey'];

const mockWorkspaceMember = {
  id: 'workspace-member-id',
  name: { firstName: 'Test', lastName: 'User' },
} as Request['workspaceMember'];

describe('WorkspaceAuthContextMiddleware', () => {
  let middleware: WorkspaceAuthContextMiddleware;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new WorkspaceAuthContextMiddleware();
    mockResponse = {} as Response;
    mockNext = jest.fn();
  });

  const buildRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      workspace: mockWorkspace,
      ...overrides,
    }) as unknown as Request;

  it('should call next without auth context when workspace is not defined', () => {
    const req = buildRequest({ workspace: undefined });

    middleware.use(req, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(workspaceAuthContextStorage.getStore()).toBeUndefined();
  });

  it('should create an apiKey auth context when apiKey is present', () => {
    const req = buildRequest({ apiKey: mockApiKey });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({ type: 'apiKey', apiKey: mockApiKey }),
    );
  });

  it('should create a user auth context when both application and user are present', () => {
    const req = buildRequest({
      application: mockApplication,
      user: mockUser,
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      workspaceMember: mockWorkspaceMember,
    });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({
        type: 'user',
        user: mockUser,
        userWorkspaceId: 'user-workspace-id',
        workspaceMemberId: 'workspace-member-id',
        workspaceMember: mockWorkspaceMember,
      }),
    );
  });

  it('should create an application auth context when application is present without user', () => {
    const req = buildRequest({ application: mockApplication });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({
        type: 'application',
        application: mockApplication,
      }),
    );
  });

  it('should fall back to application auth context when application and user are present but workspaceMember is missing', () => {
    const req = buildRequest({
      application: mockApplication,
      user: mockUser,
      userWorkspaceId: 'user-workspace-id',
    });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({
        type: 'application',
        application: mockApplication,
      }),
    );
  });

  it('should create a user auth context when user is present without application', () => {
    const req = buildRequest({
      user: mockUser,
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      workspaceMember: mockWorkspaceMember,
    });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({
        type: 'user',
        user: mockUser,
        userWorkspaceId: 'user-workspace-id',
      }),
    );
  });

  it('should create a pendingActivationUser auth context when user and userWorkspaceId are present without workspaceMember', () => {
    const req = buildRequest({
      user: mockUser,
      userWorkspaceId: 'user-workspace-id',
    });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({
        type: 'pendingActivationUser',
        user: mockUser,
        userWorkspaceId: 'user-workspace-id',
      }),
    );
  });

  it('should throw AuthException when workspace is present but no auth mechanism is found', () => {
    const req = buildRequest();

    expect(() => middleware.use(req, mockResponse, mockNext)).toThrow(
      new AuthException(
        'No authentication context found',
        AuthExceptionCode.UNAUTHENTICATED,
      ),
    );
  });

  it('should prioritize apiKey over application and user', () => {
    const req = buildRequest({
      apiKey: mockApiKey,
      application: mockApplication,
      user: mockUser,
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      workspaceMember: mockWorkspaceMember,
    });
    let capturedContext: unknown;

    (mockNext as jest.Mock).mockImplementation(() => {
      capturedContext = workspaceAuthContextStorage.getStore();
    });

    middleware.use(req, mockResponse, mockNext);

    expect(capturedContext).toEqual(
      expect.objectContaining({ type: 'apiKey' }),
    );
  });
});
