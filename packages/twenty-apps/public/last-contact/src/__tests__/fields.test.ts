/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

const FIELD_MODULES = import.meta.glob<{
  default: { success: boolean; config: { isAuditLogged?: boolean } };
}>(['../fields/**/*.ts', '!../fields/**/__tests__/**'], { eager: true });

describe('fields', () => {
  it('finds the field definitions', () => {
    expect(Object.keys(FIELD_MODULES).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(FIELD_MODULES))(
    'keeps %s off the record timeline',
    (_path, { default: field }) => {
      expect(field.success).toBe(true);
      expect(field.config.isAuditLogged).toBe(false);
    },
  );
});
