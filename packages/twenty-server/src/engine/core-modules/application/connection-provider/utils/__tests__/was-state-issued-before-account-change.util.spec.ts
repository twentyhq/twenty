import { wasStateIssuedBeforeAccountChange } from 'src/engine/core-modules/application/connection-provider/utils/was-state-issued-before-account-change.util';

const ISSUED_AT_SECONDS = 1_800_000_000;

describe('wasStateIssuedBeforeAccountChange', () => {
  it('is true when the connection was archived after the state was issued', () => {
    expect(
      wasStateIssuedBeforeAccountChange({
        stateIssuedAtSeconds: ISSUED_AT_SECONDS,
        connectedAccount: {
          archivedAt: new Date((ISSUED_AT_SECONDS + 60) * 1000),
          authFailedAt: null,
        },
      }),
    ).toBe(true);
  });

  it('is true when the connection failed after the state was issued', () => {
    expect(
      wasStateIssuedBeforeAccountChange({
        stateIssuedAtSeconds: ISSUED_AT_SECONDS,
        connectedAccount: {
          archivedAt: null,
          authFailedAt: new Date((ISSUED_AT_SECONDS + 60) * 1000),
        },
      }),
    ).toBe(true);
  });

  it('is false for a state issued after the change, or in the same second', () => {
    expect(
      wasStateIssuedBeforeAccountChange({
        stateIssuedAtSeconds: ISSUED_AT_SECONDS,
        connectedAccount: {
          archivedAt: new Date((ISSUED_AT_SECONDS - 60) * 1000),
          authFailedAt: new Date(ISSUED_AT_SECONDS * 1000 + 500),
        },
      }),
    ).toBe(false);
  });

  it('is false for a healthy connection or a state without iat', () => {
    expect(
      wasStateIssuedBeforeAccountChange({
        stateIssuedAtSeconds: ISSUED_AT_SECONDS,
        connectedAccount: { archivedAt: null, authFailedAt: null },
      }),
    ).toBe(false);
    expect(
      wasStateIssuedBeforeAccountChange({
        stateIssuedAtSeconds: undefined,
        connectedAccount: {
          archivedAt: new Date((ISSUED_AT_SECONDS + 60) * 1000),
          authFailedAt: null,
        },
      }),
    ).toBe(false);
  });
});
