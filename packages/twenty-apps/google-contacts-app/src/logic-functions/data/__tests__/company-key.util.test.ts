import { describe, expect, it } from 'vitest';

import {
  buildCompanyKey,
  readCompanyDomain,
} from 'src/logic-functions/data/company-key.util';

describe('readCompanyDomain', () => {
  it('should reduce a url to its hostname', () => {
    expect(readCompanyDomain('https://acme.com/careers')).toBe('acme.com');
  });

  it('should accept a bare domain', () => {
    expect(readCompanyDomain('acme.com')).toBe('acme.com');
  });

  it('should drop a leading www and lowercase the rest', () => {
    expect(readCompanyDomain('WWW.Acme.com')).toBe('acme.com');
  });

  it('should return nothing for a missing or unparseable domain', () => {
    expect(readCompanyDomain(undefined)).toBeUndefined();
    expect(readCompanyDomain('   ')).toBeUndefined();
  });
});

describe('buildCompanyKey', () => {
  it('should key on the domain when there is one', () => {
    expect(buildCompanyKey({ name: 'Acme', domain: 'acme.com' })).toBe(
      'domain:acme.com',
    );
  });

  it('should key on the lowercased name when there is no domain', () => {
    expect(buildCompanyKey({ name: '  ACME  ' })).toBe('name:acme');
  });

  it('should not let a name collide with a domain', () => {
    expect(buildCompanyKey({ name: 'acme.com' })).toBe('name:acme.com');
  });

  it('should return nothing for an organization with neither', () => {
    expect(buildCompanyKey({ title: 'Engineer' })).toBeUndefined();
    expect(buildCompanyKey(undefined)).toBeUndefined();
  });
});
