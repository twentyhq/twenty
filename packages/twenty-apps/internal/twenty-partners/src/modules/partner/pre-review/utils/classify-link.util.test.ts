import { describe, expect, it } from 'vitest';

import {
  classifyLink,
  isVideoClassification,
  type LinkFetchOutcome,
} from './classify-link.util';

const ok = (html: string): LinkFetchOutcome => ({
  status: 200,
  html,
  isTimeout: false,
});

const failed = (status: number | null): LinkFetchOutcome => ({
  status,
  html: null,
  isTimeout: false,
});

describe('classifyLink', () => {
  it('detects a live Twenty instance from the app shell title', () => {
    expect(
      classifyLink({
        url: 'https://crm.acme.com',
        outcome: ok('<html><head><title>Twenty</title></head></html>'),
      }),
    ).toBe('twenty-instance');
  });

  it('detects a Twenty instance on a *.twenty.com subdomain', () => {
    expect(
      classifyLink({
        url: 'https://acme.twenty.com/objects/companies',
        outcome: ok('<title>Twenty - CRM</title>'),
      }),
    ).toBe('twenty-instance');
  });

  it('classifies an ordinary marketing site', () => {
    expect(
      classifyLink({
        url: 'https://acme.com/case-studies',
        outcome: ok('<title>Acme — CRM consultants</title>'),
      }),
    ).toBe('site');
  });

  it('classifies code hosts', () => {
    expect(
      classifyLink({ url: 'https://github.com/acme/twenty-app', outcome: ok('') }),
    ).toBe('github');
    expect(
      classifyLink({ url: 'https://gitlab.com/acme/twenty', outcome: ok('') }),
    ).toBe('github');
  });

  it('classifies video hosts by provider', () => {
    expect(
      classifyLink({ url: 'https://www.youtube.com/watch?v=abc', outcome: ok('') }),
    ).toBe('video-youtube');
    expect(classifyLink({ url: 'https://youtu.be/abc', outcome: ok('') })).toBe(
      'video-youtube',
    );
    expect(
      classifyLink({ url: 'https://www.loom.com/share/abc', outcome: ok('') }),
    ).toBe('video-loom');
    expect(classifyLink({ url: 'https://www.tella.tv/video/abc', outcome: ok('') })).toBe(
      'video-tella',
    );
    expect(classifyLink({ url: 'https://vimeo.com/12345', outcome: ok('') })).toBe(
      'video-other',
    );
  });

  it('classifies shared folders and file drops', () => {
    expect(
      classifyLink({
        url: 'https://drive.google.com/drive/folders/abc',
        outcome: ok(''),
      }),
    ).toBe('drive-or-filedrop');
    expect(
      classifyLink({ url: 'https://we.tl/t-abc', outcome: ok('') }),
    ).toBe('drive-or-filedrop');
    expect(
      classifyLink({
        url: 'https://acme.sharepoint.com/:v:/g/abc',
        outcome: ok(''),
      }),
    ).toBe('drive-or-filedrop');
  });

  it('classifies LinkedIn by host even when it answers 999', () => {
    expect(
      classifyLink({
        url: 'https://www.linkedin.com/in/ada',
        outcome: failed(999),
      }),
    ).toBe('linkedin');
  });

  it('marks a 404 and a DNS failure dead', () => {
    expect(
      classifyLink({ url: 'https://acme.com/gone', outcome: failed(404) }),
    ).toBe('dead');
    expect(
      classifyLink({ url: 'https://nope.invalid', outcome: failed(null) }),
    ).toBe('dead');
  });

  it('keeps an auth wall and a timeout neutral', () => {
    expect(
      classifyLink({ url: 'https://acme.com/private', outcome: failed(403) }),
    ).toBe('site');
    expect(
      classifyLink({
        url: 'https://slow.acme.com',
        outcome: { status: null, html: null, isTimeout: true },
      }),
    ).toBe('site');
  });

  it('treats an unparseable URL as dead', () => {
    expect(classifyLink({ url: 'not a url', outcome: ok('') })).toBe('dead');
  });

  it('reports which classifications are videos', () => {
    expect(isVideoClassification('video-loom')).toBe(true);
    expect(isVideoClassification('video-youtube')).toBe(true);
    expect(isVideoClassification('site')).toBe(false);
  });
});
