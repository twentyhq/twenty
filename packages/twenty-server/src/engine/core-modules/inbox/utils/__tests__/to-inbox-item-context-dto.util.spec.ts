import {
  InboxItemContextEntityKind,
  InboxItemContextSourceKind,
} from 'src/engine/core-modules/inbox/dtos/inbox-item-context.dto';
import { toInboxItemContextDto } from 'src/engine/core-modules/inbox/utils/to-inbox-item-context-dto.util';

describe('toInboxItemContextDto', () => {
  it('returns an empty context rather than throwing on anything that is not an object', () => {
    const empty = {
      summary: null,
      source: null,
      entities: [],
      edges: [],
    };

    expect(toInboxItemContextDto(null)).toEqual(empty);
    expect(toInboxItemContextDto('a string')).toEqual(empty);
    expect(toInboxItemContextDto([])).toEqual(empty);
  });

  it('reads the kinds producers already wrote in lower case', () => {
    const context = toInboxItemContextDto({
      summary: 'Marie asked about the renewal',
      source: { kind: 'email', label: 'Re: Renewal', messageCount: 3 },
      entities: [{ key: 'marie', label: 'Marie', kind: 'person' }],
      edges: [{ from: 'marie', to: 'google', label: 'works at' }],
    });

    expect(context.source).toEqual({
      kind: InboxItemContextSourceKind.EMAIL,
      label: 'Re: Renewal',
      detail: null,
      excerpt: null,
      messageCount: 3,
    });
    expect(context.entities[0].kind).toBe(InboxItemContextEntityKind.PERSON);
  });

  it('drops a source with no label instead of returning a half built one', () => {
    expect(
      toInboxItemContextDto({ source: { kind: 'email' } }).source,
    ).toBeNull();
  });

  it('drops entities and edges that do not hold up, keeping the rest', () => {
    const context = toInboxItemContextDto({
      entities: [
        { key: 'marie', label: 'Marie', kind: 'person' },
        { key: 'no-label' },
        'not an entity',
      ],
      edges: [
        { from: 'marie', to: 'google', label: 'works at' },
        { from: 'marie' },
      ],
    });

    expect(context.entities).toHaveLength(1);
    expect(context.edges).toHaveLength(1);
  });

  it('falls back to OTHER for an entity kind nothing recognises', () => {
    const context = toInboxItemContextDto({
      entities: [{ key: 'x', label: 'X', kind: 'spaceship' }],
    });

    expect(context.entities[0].kind).toBe(InboxItemContextEntityKind.OTHER);
  });
});
