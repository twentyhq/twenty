/* @license Enterprise */

import { parseCreditTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/parse-credit-top-up-invoice-metadata.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('parseCreditTopUpInvoiceMetadata', () => {
  it('reads the workspace and the purchased amount', () => {
    expect(
      parseCreditTopUpInvoiceMetadata({
        kind: 'CREDIT_TOP_UP',
        workspaceId: WORKSPACE_ID,
        creditAmountMicro: '10000000000',
      }),
    ).toEqual({ workspaceId: WORKSPACE_ID, creditAmountMicro: 10_000_000_000 });
  });

  it('reads nothing without metadata', () => {
    expect(parseCreditTopUpInvoiceMetadata(null)).toEqual({
      workspaceId: null,
      creditAmountMicro: null,
    });
  });

  it.each([
    ['no workspace', { creditAmountMicro: '1000000' }],
    ['an empty workspace', { workspaceId: '', creditAmountMicro: '1000000' }],
  ])('reads no workspace from %s', (_label, metadata) => {
    expect(parseCreditTopUpInvoiceMetadata(metadata)).toEqual({
      workspaceId: null,
      creditAmountMicro: 1_000_000,
    });
  });

  it.each([
    ['no amount', { workspaceId: WORKSPACE_ID }],
    [
      'a non-numeric amount',
      { workspaceId: WORKSPACE_ID, creditAmountMicro: 'ten' },
    ],
    ['a zero amount', { workspaceId: WORKSPACE_ID, creditAmountMicro: '0' }],
    [
      'a negative amount',
      { workspaceId: WORKSPACE_ID, creditAmountMicro: '-5' },
    ],
    [
      'a fractional amount',
      { workspaceId: WORKSPACE_ID, creditAmountMicro: '1.5' },
    ],
    [
      'an amount beyond safe integers',
      { workspaceId: WORKSPACE_ID, creditAmountMicro: '9007199254740993' },
    ],
  ])('reads no amount from %s', (_label, metadata) => {
    expect(parseCreditTopUpInvoiceMetadata(metadata)).toEqual({
      workspaceId: WORKSPACE_ID,
      creditAmountMicro: null,
    });
  });
});
