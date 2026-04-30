import { describe, expect, it } from 'vitest';

import { toEmailsField } from '@modules/resend/shared/utils/to-emails-field';

describe('toEmailsField', () => {
  it('returns a plain email unchanged', () => {
    expect(toEmailsField('thomas@mail.twenty.com')).toEqual({
      primaryEmail: 'thomas@mail.twenty.com',
      additionalEmails: null,
    });
  });

  it('extracts the email from "Name <email>" format', () => {
    expect(toEmailsField('Thomas <thomas@mail.twenty.com>')).toEqual({
      primaryEmail: 'thomas@mail.twenty.com',
      additionalEmails: null,
    });
  });

  it('extracts the email from a quoted display name', () => {
    expect(toEmailsField('"Last, First" <thomas@mail.twenty.com>')).toEqual({
      primaryEmail: 'thomas@mail.twenty.com',
      additionalEmails: null,
    });
  });

  it('normalizes each entry of an array of mixed formats', () => {
    expect(
      toEmailsField([
        'Alice <alice@example.com>',
        'bob@example.com',
        '"Carol C." <carol@example.com>',
      ]),
    ).toEqual({
      primaryEmail: 'alice@example.com',
      additionalEmails: ['bob@example.com', 'carol@example.com'],
    });
  });

  it('returns empty primaryEmail for null', () => {
    expect(toEmailsField(null)).toEqual({
      primaryEmail: '',
      additionalEmails: null,
    });
  });

  it('returns empty primaryEmail for undefined', () => {
    expect(toEmailsField(undefined)).toEqual({
      primaryEmail: '',
      additionalEmails: null,
    });
  });

  it('returns empty primaryEmail for an empty string', () => {
    expect(toEmailsField('')).toEqual({
      primaryEmail: '',
      additionalEmails: null,
    });
  });

  it('trims surrounding whitespace from a plain email', () => {
    expect(toEmailsField('  thomas@mail.twenty.com  ')).toEqual({
      primaryEmail: 'thomas@mail.twenty.com',
      additionalEmails: null,
    });
  });

  it('lowercases a plain email', () => {
    expect(toEmailsField('Thomas@Mail.Twenty.Com')).toEqual({
      primaryEmail: 'thomas@mail.twenty.com',
      additionalEmails: null,
    });
  });

  it('lowercases the address inside the "Name <email>" format', () => {
    expect(toEmailsField('Thomas <Thomas@Mail.Twenty.Com>')).toEqual({
      primaryEmail: 'thomas@mail.twenty.com',
      additionalEmails: null,
    });
  });

  it('lowercases each entry of an array', () => {
    expect(
      toEmailsField([
        'Alice <Alice@Example.com>',
        'BOB@example.com',
        '"Carol C." <Carol@EXAMPLE.com>',
      ]),
    ).toEqual({
      primaryEmail: 'alice@example.com',
      additionalEmails: ['bob@example.com', 'carol@example.com'],
    });
  });
});
