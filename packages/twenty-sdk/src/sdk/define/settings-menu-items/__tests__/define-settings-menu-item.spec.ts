import { describe, expect, it } from 'vitest';

import { defineSettingsMenuItem } from '@/sdk/define/settings-menu-items/define-settings-menu-item';

const VALID_CONFIG = {
  universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  frontComponentUniversalIdentifier: '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7',
  title: 'Sync',
};

describe('defineSettingsMenuItem', () => {
  it('should accept a minimal item', () => {
    const result = defineSettingsMenuItem({ ...VALID_CONFIG });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept icon, position and scope', () => {
    const result = defineSettingsMenuItem({
      ...VALID_CONFIG,
      icon: 'IconRefresh',
      position: 1.5,
      scope: 'USER',
    });

    expect(result.success).toBe(true);
    expect(result.config.scope).toBe('USER');
  });

  it('should require a universalIdentifier', () => {
    const result = defineSettingsMenuItem({
      ...VALID_CONFIG,
      universalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'SettingsMenuItem must have a universalIdentifier',
    );
  });

  it('should require a title', () => {
    const result = defineSettingsMenuItem({ ...VALID_CONFIG, title: '' });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('SettingsMenuItem must have a title');
  });

  it('should reject the reserved General title', () => {
    const result = defineSettingsMenuItem({
      ...VALID_CONFIG,
      title: 'General',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'SettingsMenuItem title "General" is reserved for the built-in settings menu item',
    );
  });

  it('should require a frontComponentUniversalIdentifier', () => {
    const result = defineSettingsMenuItem({
      ...VALID_CONFIG,
      frontComponentUniversalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain(
      'SettingsMenuItem must have a frontComponentUniversalIdentifier',
    );
  });

  it('should reject a non-numeric position', () => {
    const result = defineSettingsMenuItem({
      ...VALID_CONFIG,
      position: Number.NaN,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'SettingsMenuItem position must be a number',
    );
  });

  it('should accept a negative position', () => {
    const result = defineSettingsMenuItem({ ...VALID_CONFIG, position: -1 });

    expect(result.success).toBe(true);
  });

  it('should reject an unknown scope', () => {
    const result = defineSettingsMenuItem({
      ...VALID_CONFIG,
      scope: 'WORKSPACE_MEMBER' as never,
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('SettingsMenuItem scope must be one of');
  });
});
