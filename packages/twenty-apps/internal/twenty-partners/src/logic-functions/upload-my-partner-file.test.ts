import { describe, expect, it } from 'vitest';

import {
  fieldIdForTarget,
  uploadFileSchema,
  validateUploadTarget,
} from './upload-my-partner-file.logic-function';

describe('fieldIdForTarget', () => {
  it('resolves the profile picture field id for profilePicture', () => {
    expect(fieldIdForTarget('profilePicture')).toBe('076b81f2-2398-4ece-a352-d7a6f6a89cae');
  });

  it('resolves the cover image field id for caseStudyCover', () => {
    expect(fieldIdForTarget('caseStudyCover')).toBe('6b1225d3-f666-4c7b-8309-ab95cd5f44ea');
  });
});

describe('uploadFileSchema', () => {
  it('accepts a valid profilePicture body', () => {
    const parsed = uploadFileSchema.safeParse({
      target: 'profilePicture',
      filename: 'avatar.png',
      contentType: 'image/png',
      dataBase64: 'AAAA',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an empty dataBase64', () => {
    const parsed = uploadFileSchema.safeParse({
      target: 'profilePicture',
      filename: 'avatar.png',
      contentType: 'image/png',
      dataBase64: '',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown target', () => {
    const parsed = uploadFileSchema.safeParse({
      target: 'banner',
      filename: 'avatar.png',
      contentType: 'image/png',
      dataBase64: 'AAAA',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing contentType', () => {
    const parsed = uploadFileSchema.safeParse({
      target: 'profilePicture',
      filename: 'avatar.png',
      dataBase64: 'AAAA',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('validateUploadTarget', () => {
  it('errors when caseStudyCover has no recordId', () => {
    const parsed = uploadFileSchema.parse({
      target: 'caseStudyCover',
      filename: 'cover.png',
      contentType: 'image/png',
      dataBase64: 'AAAA',
    });

    expect(validateUploadTarget(parsed)).toEqual({
      error: 'recordId is required for caseStudyCover uploads',
    });
  });

  it('passes when caseStudyCover has a recordId', () => {
    const parsed = uploadFileSchema.parse({
      target: 'caseStudyCover',
      recordId: 'content-1',
      filename: 'cover.png',
      contentType: 'image/png',
      dataBase64: 'AAAA',
    });

    expect(validateUploadTarget(parsed)).toBeNull();
  });

  it('passes for profilePicture regardless of recordId', () => {
    const parsed = uploadFileSchema.parse({
      target: 'profilePicture',
      filename: 'avatar.png',
      contentType: 'image/png',
      dataBase64: 'AAAA',
    });

    expect(validateUploadTarget(parsed)).toBeNull();
  });
});
