import { InboxItemContextSourceKind } from 'src/engine/core-modules/inbox/dtos/inbox-item-context.dto';
import { toInboxItemContextDto } from 'src/engine/core-modules/inbox/utils/to-inbox-item-context-dto.util';

describe('toInboxItemContextDto', () => {
  it('returns an unknown provenance rather than throwing on anything that is not an object', () => {
    const unknown = { version: 0, producer: 'unknown', source: null };

    expect(toInboxItemContextDto(null)).toEqual(unknown);
    expect(toInboxItemContextDto('a string')).toEqual(unknown);
    expect(toInboxItemContextDto([])).toEqual(unknown);
  });

  it('keeps the producer and version a row was written with', () => {
    expect(
      toInboxItemContextDto({ version: 1, producer: 'agentChat' }),
    ).toEqual({ version: 1, producer: 'agentChat', source: null });
  });

  it('reads a source kind written in lower case', () => {
    const context = toInboxItemContextDto({
      version: 1,
      producer: 'seed',
      source: { kind: 'email', label: 'Re: Renewal', messageCount: 3 },
    });

    expect(context.source).toEqual({
      kind: InboxItemContextSourceKind.EMAIL,
      label: 'Re: Renewal',
      detail: null,
      excerpt: null,
      messageCount: 3,
    });
  });

  it('drops a source with no label instead of returning a half built one', () => {
    expect(
      toInboxItemContextDto({ version: 1, producer: 'seed', source: {} })
        .source,
    ).toBeNull();
  });

  it('drops a source whose kind nothing recognises', () => {
    expect(
      toInboxItemContextDto({
        version: 1,
        producer: 'seed',
        source: { kind: 'carrier pigeon', label: 'A note' },
      }).source,
    ).toBeNull();
  });
});
