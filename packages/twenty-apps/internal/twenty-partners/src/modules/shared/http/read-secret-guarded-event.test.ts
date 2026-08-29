import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { readSecretGuardedEvent } from './read-secret-guarded-event';

const schema = z.object({ name: z.string().trim().min(1) });

describe('readSecretGuardedEvent', () => {
  const original = process.env.PARTNER_APPLICATION_SECRET;

  afterEach(() => {
    if (original === undefined) delete process.env.PARTNER_APPLICATION_SECRET;
    else process.env.PARTNER_APPLICATION_SECRET = original;
  });

  it('returns unauthorized when PARTNER_APPLICATION_SECRET is not set', () => {
    delete process.env.PARTNER_APPLICATION_SECRET;
    const result = readSecretGuardedEvent(
      { headers: { 'x-application-secret': 'anything' }, body: { name: 'Acme' } },
      schema,
    );
    expect(result).toEqual({ ok: false, reason: 'unauthorized' });
  });

  describe('with a secret configured', () => {
    beforeEach(() => {
      process.env.PARTNER_APPLICATION_SECRET = 'shh';
    });

    it('returns unauthorized when the header is missing', () => {
      const result = readSecretGuardedEvent({ body: { name: 'Acme' } }, schema);
      expect(result).toEqual({ ok: false, reason: 'unauthorized' });
    });

    it('returns unauthorized when the header does not match', () => {
      const result = readSecretGuardedEvent(
        { headers: { 'x-application-secret': 'wrong' }, body: { name: 'Acme' } },
        schema,
      );
      expect(result).toEqual({ ok: false, reason: 'unauthorized' });
    });

    it('returns invalid_input when the header matches but the body fails the schema', () => {
      const result = readSecretGuardedEvent(
        { headers: { 'x-application-secret': 'shh' }, body: { name: '' } },
        schema,
      );
      expect(result).toEqual({ ok: false, reason: 'invalid_input' });
    });

    it('returns ok with the parsed input when the header matches and the body is valid', () => {
      const result = readSecretGuardedEvent(
        { headers: { 'x-application-secret': 'shh' }, body: { name: 'Acme' } },
        schema,
      );
      expect(result).toEqual({ ok: true, input: { name: 'Acme' } });
    });

    it('treats a raw (non-event) payload as the body directly', () => {
      const result = readSecretGuardedEvent({ name: 'Acme' }, schema);
      expect(result).toEqual({ ok: false, reason: 'unauthorized' });
    });
  });
});
