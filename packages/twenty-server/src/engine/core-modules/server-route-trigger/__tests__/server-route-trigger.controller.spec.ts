import { type Request, type Response } from 'express';

import { ServerRouteTriggerController } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.controller';
import { type ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';

const RESOLVER_UID = 'b3c2f0a1-7d4e-4c9a-9f2b-2e1d6a4c8e10';

// sendRouteTriggerResponse reads back the content type it may have just set, so
// the mock has to remember what was stored on it.
const createResponseMock = () => {
  const headers: Record<string, string> = {};

  return {
    status: jest.fn(),
    setHeader: jest.fn((key: string, value: string) => {
      headers[key.toLowerCase()] = value;
    }),
    getHeader: jest.fn((key: string) => headers[key.toLowerCase()]),
    send: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
};

const createRequestMock = (method: 'GET' | 'POST') =>
  ({
    method,
    path: `/webhooks/server/${RESOLVER_UID}`,
    query: {},
    headers: {},
  }) as unknown as Request;

describe('ServerRouteTriggerController', () => {
  let controller: ServerRouteTriggerController;
  const handle = jest.fn();

  beforeEach(() => {
    const serverRouteTriggerService = {
      handle,
    } as unknown as ServerRouteTriggerService;

    controller = new ServerRouteTriggerController(serverRouteTriggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates a POST to the service with the resolver identifier', async () => {
    const request = createRequestMock('POST');
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: { queued: true },
    });

    await controller.post(RESOLVER_UID, request, response);

    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledWith({
      request,
      resolverLogicFunctionUniversalIdentifier: RESOLVER_UID,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ queued: true });
  });

  it('delegates a GET to the service exactly as it delegates a POST', async () => {
    const request = createRequestMock('GET');
    const response = createResponseMock();

    handle.mockResolvedValue({ statusCode: 200, headers: {}, body: 'ok' });

    await controller.get(RESOLVER_UID, request, response);

    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledWith({
      request,
      resolverLogicFunctionUniversalIdentifier: RESOLVER_UID,
    });
  });

  it('relays a verification challenge on a GET as text rather than JSON', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: 'challenge-123',
    });

    await controller.get(RESOLVER_UID, createRequestMock('GET'), response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.setHeader).toHaveBeenCalledWith(
      'content-type',
      'text/plain',
    );
    expect(response.send).toHaveBeenCalledWith('challenge-123');
    expect(response.json).not.toHaveBeenCalled();
  });

  it('keeps the content type the resolver asked for on a GET', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'challenge-123',
    });

    await controller.get(RESOLVER_UID, createRequestMock('GET'), response);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/plain; charset=utf-8',
    );
    expect(response.setHeader).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledWith('challenge-123');
  });

  it('relays a rejection from the resolver on a GET instead of masking it', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 403,
      headers: {},
      body: 'Forbidden',
    });

    await controller.get(RESOLVER_UID, createRequestMock('GET'), response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.send).toHaveBeenCalledWith('Forbidden');
  });
});
