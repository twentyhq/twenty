import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '../../../../../../../');
const MIGRATION_PATH = join(
  PROJECT_ROOT,
  'supabase/migrations/202606190001_create_crm_readonly_source_views.sql',
);

function readMigrationOrSkip(): string {
  return readFileSync(MIGRATION_PATH, 'utf8');
}

describe('CRM read-only source views migration (202606190001)', () => {
  const sql = readMigrationOrSkip();

  // ---------------------------------------------------------------------------
  // 1. Migration defines all four new v_twenty_* views
  // ---------------------------------------------------------------------------
  it('defines crm.v_twenty_products', () => {
    expect(sql).toMatch(/create\s+or\s+replace\s+view\s+crm\.v_twenty_products/i);
  });

  it('defines crm.v_twenty_order_items', () => {
    expect(sql).toMatch(/create\s+or\s+replace\s+view\s+crm\.v_twenty_order_items/i);
  });

  it('defines crm.v_twenty_customer_expertise', () => {
    expect(sql).toMatch(
      /create\s+or\s+replace\s+view\s+crm\.v_twenty_customer_expertise/i,
    );
  });

  it('defines crm.v_twenty_payments', () => {
    expect(sql).toMatch(
      /create\s+or\s+replace\s+view\s+crm\.v_twenty_payments\b/i,
    );
  });

  // ---------------------------------------------------------------------------
  // 2. crm_readonly role created without an embedded literal password
  // ---------------------------------------------------------------------------
  it('creates or ensures role crm_readonly without a literal password', () => {
    // Must mention the role — accept CREATE ROLE, DO block, or idempotent pattern
    expect(sql).toMatch(/crm_readonly/i);
    // The role definition must appear (CREATE ROLE, or ALTER ROLE, or a DO block)
    expect(sql).toMatch(
      /(?:create\s+role\s+if\s+not\s+exists\s+crm_readonly|do\s*\$\$[\s\S]{0,600}crm_readonly)/i,
    );
    // MUST NOT embed a literal password inline — passwords must come from vault/secret
    expect(sql).not.toMatch(/password\s+'[^']+'/i);
    expect(sql).not.toMatch(/password\s+\$[^;]+/i);
    expect(sql).not.toMatch(/encrypted\s+password\s+'/i);
  });

  // ---------------------------------------------------------------------------
  // 3. Grants USAGE ON SCHEMA crm and SELECT on all eight v_twenty_* views
  // ---------------------------------------------------------------------------
  it('grants USAGE ON SCHEMA crm to crm_readonly', () => {
    expect(sql).toMatch(
      /grant\s+usage\s+on\s+schema\s+crm\s+to\s+crm_readonly/i,
    );
  });

  it.each([
    'ambassadors',
    'people',
    'orders',
    'commissions',
    'products',
    'order_items',
    'customer_expertise',
    'payments',
  ])('grants SELECT on crm.v_twenty_%s to crm_readonly', (viewName) => {
    expect(sql).toMatch(
      new RegExp(
        `grant\\s+select\\s+on\\s+crm\\.v_twenty_${viewName}\\s+to\\s+crm_readonly`,
        'i',
      ),
    );
  });

  // ---------------------------------------------------------------------------
  // 4. Does NOT grant SELECT on public.* or auth.* to crm_readonly
  // ---------------------------------------------------------------------------
  it('does not grant SELECT on any public.* table to crm_readonly', () => {
    expect(sql).not.toMatch(
      /grant\s+select\s+on\s+(all\s+tables\s+in\s+)?public\.\*\s+to\s+crm_readonly/i,
    );
  });

  it('does not grant SELECT on any auth.* table to crm_readonly', () => {
    expect(sql).not.toMatch(
      /grant\s+select\s+on\s+(all\s+tables\s+in\s+)?auth\.\*\s+to\s+crm_readonly/i,
    );
  });

  // ---------------------------------------------------------------------------
  // 5. v_twenty_payments comment indicates sanitized fields, no raw gateway payload
  // ---------------------------------------------------------------------------
  it('has a comment on v_twenty_payments mentioning sanitized fields', () => {
    expect(sql).toMatch(
      /comment\s+on\s+view\s+crm\.v_twenty_payments\s+is/i,
    );
    expect(sql).toMatch(/v_twenty_payments[\s\S]{0,400}sanitiz/i);
  });

  it('does not project raw gateway payload columns in v_twenty_payments', () => {
    // Read the view body between CREATE VIEW ... AS and the next semicolon
    // or matching DO block end; assert no raw gateway columns are selected
    const paymentsViewMatch = sql.match(
      /create\s+or\s+replace\s+view\s+crm\.v_twenty_payments[\s\S]{1,2000}(?:;|end\s*;)/i,
    );
    expect(paymentsViewMatch).not.toBeNull();
    if (paymentsViewMatch) {
      const viewBody = paymentsViewMatch[0];
      const rawProjectionIndicators = [
        /gateway_response/i,
        /gateway_raw/i,
        /raw_payload/i,
        /processor_raw/i,
        /stripe\./i,
        /charge_object/i,
      ];
      for (const pattern of rawProjectionIndicators) {
        expect(viewBody).not.toMatch(pattern);
      }
    }
  });
});
