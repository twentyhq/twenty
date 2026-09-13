import { isFieldActorValue } from '@/object-record/record-field/ui/types/guards/isFieldActorValue';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('isFieldActorValue', () => {
  it('accepts MANUAL actors whose context.provider is null (GraphQL ActorContext shape)', () => {
    expect(
      isFieldActorValue({
        source: 'MANUAL',
        workspaceMemberId: 'member-id',
        name: 'Dani S',
        context: { provider: null },
      }),
    ).toBe(true);
  });

  it('accepts actors with a connected-account provider', () => {
    expect(
      isFieldActorValue({
        source: 'CALENDAR',
        workspaceMemberId: 'member-id',
        name: 'Dani S',
        context: { provider: ConnectedAccountProvider.MICROSOFT },
      }),
    ).toBe(true);
  });

  it('accepts actors with context.provider omitted', () => {
    expect(
      isFieldActorValue({
        source: 'SYSTEM',
        workspaceMemberId: null,
        name: 'System',
        context: {},
      }),
    ).toBe(true);
  });

  it('rejects non-actor values', () => {
    expect(isFieldActorValue(null)).toBe(false);
    expect(isFieldActorValue({ name: 'Dani S' })).toBe(false);
  });
});
