import { HttpStatus } from '@nestjs/common';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { resolveMcpRequestProtocol } from 'src/engine/api/mcp/utils/resolve-mcp-request-protocol.util';

const STATELESS_META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientCapabilities': {},
};

const STATELESS_HEADERS = {
  protocolVersion: '2026-07-28',
};

describe('resolveMcpRequestProtocol', () => {
  it('keeps initialize on the legacy flow', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'initialize',
        params: { protocolVersion: '2025-06-18' },
        headers: {},
      }),
    ).toEqual({ era: 'legacy' });
  });

  it('treats requests without per-request metadata as legacy', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: undefined,
        headers: { protocolVersion: '2025-06-18' },
      }),
    ).toEqual({ era: 'legacy' });

    expect(
      resolveMcpRequestProtocol({
        method: 'ping',
        params: undefined,
        headers: {},
      }),
    ).toEqual({ era: 'legacy' });
  });

  it('accepts a stateless tools/list', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: { _meta: STATELESS_META },
        headers: { ...STATELESS_HEADERS, method: 'tools/list' },
      }),
    ).toEqual({ era: 'stateless' });
  });

  it('accepts a stateless tools/call with a base64-encoded tool name', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/call',
        params: { name: 'find_records', _meta: STATELESS_META },
        headers: {
          ...STATELESS_HEADERS,
          method: 'tools/call',
          name: `=?base64?${Buffer.from('find_records').toString('base64')}?=`,
        },
      }),
    ).toEqual({ era: 'stateless' });
  });

  it('requires _meta on server/discover', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'server/discover',
        params: undefined,
        headers: { method: 'server/discover' },
      }),
    ).toMatchObject({
      era: 'rejected',
      httpStatus: HttpStatus.BAD_REQUEST,
      error: { code: JSON_RPC_ERROR_CODE.INVALID_PARAMS },
    });
  });

  it('requires _meta when the header announces a stateless version', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: undefined,
        headers: { ...STATELESS_HEADERS, method: 'tools/list' },
      }),
    ).toMatchObject({
      era: 'rejected',
      error: { code: JSON_RPC_ERROR_CODE.INVALID_PARAMS },
    });
  });

  it('rejects a protocol version header that differs from _meta', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: { _meta: STATELESS_META },
        headers: { method: 'tools/list' },
      }),
    ).toMatchObject({
      era: 'rejected',
      httpStatus: HttpStatus.BAD_REQUEST,
      error: { code: JSON_RPC_ERROR_CODE.HEADER_MISMATCH },
    });
  });

  it('rejects an unsupported stateless version with the supported list', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: {
          _meta: {
            ...STATELESS_META,
            'io.modelcontextprotocol/protocolVersion': '2027-01-01',
          },
        },
        headers: { protocolVersion: '2027-01-01', method: 'tools/list' },
      }),
    ).toEqual({
      era: 'rejected',
      httpStatus: HttpStatus.BAD_REQUEST,
      error: {
        code: JSON_RPC_ERROR_CODE.UNSUPPORTED_PROTOCOL_VERSION,
        message: 'Unsupported protocol version',
        data: { supported: ['2026-07-28'], requested: '2027-01-01' },
      },
    });
  });

  it('requires client capabilities', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: {
          _meta: {
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
          },
        },
        headers: { ...STATELESS_HEADERS, method: 'tools/list' },
      }),
    ).toMatchObject({
      era: 'rejected',
      error: { code: JSON_RPC_ERROR_CODE.INVALID_PARAMS },
    });
  });

  it('rejects an Mcp-Method header that differs from the body', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/list',
        params: { _meta: STATELESS_META },
        headers: { ...STATELESS_HEADERS, method: 'tools/call' },
      }),
    ).toMatchObject({
      era: 'rejected',
      error: { code: JSON_RPC_ERROR_CODE.HEADER_MISMATCH },
    });
  });

  it('rejects an Mcp-Name header that differs from the tool name', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'tools/call',
        params: { name: 'find_records', _meta: STATELESS_META },
        headers: {
          ...STATELESS_HEADERS,
          method: 'tools/call',
          name: 'delete_records',
        },
      }),
    ).toMatchObject({
      era: 'rejected',
      error: { code: JSON_RPC_ERROR_CODE.HEADER_MISMATCH },
    });
  });

  it('answers 404 for methods removed from the stateless protocol', () => {
    expect(
      resolveMcpRequestProtocol({
        method: 'ping',
        params: { _meta: STATELESS_META },
        headers: { ...STATELESS_HEADERS, method: 'ping' },
      }),
    ).toMatchObject({
      era: 'rejected',
      httpStatus: HttpStatus.NOT_FOUND,
      error: { code: JSON_RPC_ERROR_CODE.METHOD_NOT_FOUND },
    });
  });
});
