import { describe, expect, it } from 'vitest';

import { formatInboxRecordReference } from '@/sdk/inbox/mentions/format-inbox-record-reference';

const COMPANY_ID = '20202020-0000-4000-8000-000000000003';

describe('formatInboxRecordReference', () => {
  it('writes a record reference that keeps its label as written', () => {
    expect(
      formatInboxRecordReference({
        objectNameSingular: 'company',
        recordId: COMPANY_ID,
        label: 'Acme: EMEA',
      }),
    ).toBe(`[[record:company:${COMPANY_ID}:Acme: EMEA]]`);
  });

  it('refuses an empty label', () => {
    expect(() =>
      formatInboxRecordReference({
        objectNameSingular: 'company',
        recordId: COMPANY_ID,
        label: '',
      }),
    ).toThrow(/needs a label/);
  });

  it.each(['Acme [EMEA]', 'Acme\nEMEA'])(
    'refuses the label %j, which the inbox cannot render',
    (label) => {
      expect(() =>
        formatInboxRecordReference({
          objectNameSingular: 'company',
          recordId: COMPANY_ID,
          label,
        }),
      ).toThrow(/brackets or line breaks/);
    },
  );
});
