#!/usr/bin/env node
// assert-disposable-postgres.mjs — fail-closed safety guard for destructive
// database operations. Verifies PG_DATABASE_URL points to a disposable local
// test database before any DB-reset integration test runs.
//
// Exit 0 = safe to proceed. Exit 1 = BLOCKED (not disposable / ambiguous).

import { execSync } from 'node:child_process';

function redactUrl(url) {
  return url.replace(/\/\/[^@]+@/, '//[REDACTED]@');
}

function main() {
  const errors = [];

  // 1. NODE_ENV must not be production
  if (process.env.NODE_ENV === 'production') {
    errors.push('NODE_ENV is production — refusing to run destructive tests');
  }

  // 2. PG_DATABASE_URL must be set
  const url = process.env.PG_DATABASE_URL;
  if (!url) {
    console.error('BLOCKED: PG_DATABASE_URL is not set');
    console.error('failureClass: SAFETY_PREREQUISITE');
    process.exit(1);
  }

  // 3. Must be postgres protocol
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    errors.push(
      `URL protocol must be postgres: or postgresql: (got ${redactUrl(url).split('://')[0]}://)`,
    );
  }

  // 4. Host must be localhost/loopback
  let parsed;
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
      errors.push(`Host must be localhost/127.0.0.1/::1 (got ${host})`);
    }
    // 5. Database name must look like a test/local DB
    const dbName = (u.pathname || '/').replace(/^\//, '');
    if (!dbName) {
      errors.push('Database name is empty in URL');
    } else if (!/(^|[_-])(test|ci|local|default)([_-]|$)/.test(dbName)) {
      errors.push(
        `Database name "${dbName}" does not match test/ci/local/default pattern`,
      );
    }
    parsed = { host, dbName, url: u };
  } catch {
    errors.push(`Could not parse PG_DATABASE_URL: ${redactUrl(url)}`);
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`BLOCKED: ${e}`);
    console.error('failureClass: SAFETY_PREREQUISITE');
    process.exit(1);
  }

  // 6. Verify psql is available and current_database() matches URL
  try {
    const currentDb = execSync(
      `psql "${url}" -Atqc "select current_database()"`,
      {
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )
      .toString()
      .trim();
    if (currentDb !== parsed.dbName) {
      console.error(
        `BLOCKED: current_database()="${currentDb}" does not match URL database="${parsed.dbName}"`,
      );
      console.error('failureClass: SAFETY_PREREQUISITE');
      process.exit(1);
    }
  } catch {
    console.error('BLOCKED: psql connection failed or psql not available');
    console.error('failureClass: SAFETY_PREREQUISITE');
    process.exit(1);
  }

  console.log(`OK: ${redactUrl(url)} is a disposable local test database`);
  process.exit(0);
}

main();
