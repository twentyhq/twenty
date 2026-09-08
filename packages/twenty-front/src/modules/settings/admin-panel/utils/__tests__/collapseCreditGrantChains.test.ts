import { collapseCreditGrantChains } from '@/settings/admin-panel/utils/collapseCreditGrantChains';

type TestGrant = {
  id: string;
  sourceGrantId?: string | null;
  amount: number;
  reason?: string | null;
};

const grant = (
  id: string,
  amount: number,
  sourceGrantId: string | null = null,
  reason: string | null = null,
): TestGrant => ({ id, amount, sourceGrantId, reason });

describe('collapseCreditGrantChains', () => {
  it('keeps an unchained grant as its own row', () => {
    const only = grant('a', 50);

    expect(collapseCreditGrantChains([only])).toEqual([
      { id: 'a', current: only, origin: only, periodCount: 1 },
    ]);
  });

  it('shows the balance left on the chain against the reason it was granted for', () => {
    const carried = grant('c', 40, 'b', 'Carried over from the period ...');
    const middle = grant('b', 70, 'a', 'Carried over from the period ...');
    const origin = grant('a', 100, null, "It's our own workspace");

    const [row] = collapseCreditGrantChains([carried, middle, origin]);

    expect(row.current).toBe(carried);
    expect(row.origin).toBe(origin);
    expect(row.periodCount).toBe(3);
  });

  it('collapses each chain separately and keeps the server ordering', () => {
    const newerOrigin = grant('b', 50);
    const carried = grant('a2', 20, 'a1');
    const olderOrigin = grant('a1', 30);

    const rows = collapseCreditGrantChains([newerOrigin, carried, olderOrigin]);

    expect(rows.map((row) => row.origin.id)).toEqual(['b', 'a1']);
    expect(rows.map((row) => row.current.id)).toEqual(['b', 'a2']);
  });

  // Revoking a grant leaves its successors behind, and a truncated list is the
  // normal case once older rows are filtered out server side.
  it('treats a grant whose source is missing as an origin of its own', () => {
    const orphan = grant('b', 20, 'missing');

    expect(collapseCreditGrantChains([orphan])).toEqual([
      { id: 'b', current: orphan, origin: orphan, periodCount: 1 },
    ]);
  });

  it('still lists every grant when the chain points back at itself', () => {
    const first = grant('a', 10, 'b');
    const second = grant('b', 10, 'a');

    const rows = collapseCreditGrantChains([first, second]);

    expect(rows.map((row) => row.current.id).sort()).toEqual(['a', 'b']);
  });
});
