#!/usr/bin/env node

/**
 * CI Check: Validate that all UserWorkspace records have role assignments
 *
 * This script runs in CI to ensure data integrity:
 * - Queries all UserWorkspace records
 * - Verifies each has at least one role assignment in roleTargets
 * - Exits with error code 1 if any are missing (fails the build)
 * - Exits with code 0 if all are valid (passes the build)
 *
 * Usage: node ci-check-role-assignments.js
 */

const { Pool } = require('pg');
const { config } = require('dotenv');

// Load environment variables from .env file
config({ path: '/Users/connor/Dev/FLCRMLMS/packages/twenty-server/.env' });

async function checkRoleAssignments() {
  const pool = new Pool({
    host: process.env.POSTGRES_ADMIN_HOST || 'localhost',
    port: process.env.POSTGRES_ADMIN_PORT || 5432,
    database: process.env.POSTGRES_ADMIN_DATABASE || 'default',
    user: process.env.POSTGRES_ADMIN_USER || 'postgres',
    password: process.env.POSTGRES_ADMIN_PASSWORD || 'postgres',
  });

  let exitCode = 0;

  try {
    console.log('🔍 Checking UserWorkspace role assignments...\n');

    // Find all UserWorkspaces that are missing role assignments
    const missingRolesQuery = `
      SELECT
        uw.id AS "userWorkspaceId",
        uw."userId",
        uw."workspaceId",
        w."displayName" AS "workspaceName",
        u.email AS "userEmail"
      FROM core."userWorkspace" uw
      LEFT JOIN core."roleTargets" rt ON rt."userWorkspaceId" = uw.id
      LEFT JOIN core."workspace" w ON w.id = uw."workspaceId"
      LEFT JOIN core."user" u ON u.id = uw."userId"
      WHERE rt.id IS NULL
        AND w."activationStatus" = 'ACTIVE'
      ORDER BY uw."workspaceId", uw."userId"
    `;

    const result = await pool.query(missingRolesQuery);

    if (result.rows.length === 0) {
      console.log('✅ All UserWorkspace records have role assignments!');
      console.log('\n📊 Summary:');
      console.log('   Total UserWorkspaces checked: ' + (await pool.query('SELECT COUNT(*) FROM core."userWorkspace"')).rows[0].count);
      console.log('   All have proper role assignments');
    } else {
      console.log(`❌ Found ${result.rows.length} UserWorkspace(s) missing role assignments:\n`);

      const workspaceStats = {};
      result.rows.forEach(row => {
        if (!workspaceStats[row.workspaceId]) {
          workspaceStats[row.workspaceId] = {
            name: row.workspaceName,
            count: 0,
            users: []
          };
        }
        workspaceStats[row.workspaceId].count++;
        workspaceStats[row.workspaceId].users.push(row.userEmail || row.userId);
      });

      Object.entries(workspaceStats).forEach(([workspaceId, stats]) => {
        console.log(`   Workspace: ${stats.name} (${workspaceId})`);
        console.log(`   Missing roles for ${stats.count} user(s): ${stats.users.join(', ')}`);
        console.log('');
      });

      console.log('\n💡 To fix this issue:');
      console.log('   1. Check your seeding scripts for bugs');
      console.log('   2. Verify workspace.defaultRoleId is set');
      console.log('   3. Run the role assignment service after seeding');
      console.log('   4. Or manually insert missing roleTargets entries\n');

      exitCode = 1;
    }

    // Additional check: Verify workspaces have defaultRoleId
    console.log('\n🔍 Checking workspaces for defaultRoleId...\n');

    const missingDefaultRoleQuery = `
      SELECT id, "displayName", "activationStatus"
      FROM core."workspace"
      WHERE "defaultRoleId" IS NULL
        AND "activationStatus" = 'ACTIVE'
    `;

    const missingDefaultRoleResult = await pool.query(missingDefaultRoleQuery);

    if (missingDefaultRoleResult.rows.length > 0) {
      console.log(`❌ Found ${missingDefaultRoleResult.rows.length} active workspace(s) without defaultRoleId:\n`);
      missingDefaultRoleResult.rows.forEach(workspace => {
        console.log(`   - ${workspace.displayName} (${workspace.id})`);
      });
      console.log('\n⚠️  Workspaces must have defaultRoleId to assign roles to new users.\n');
      exitCode = 1;
    } else {
      console.log('✅ All active workspaces have defaultRoleId set');
    }

  } catch (error) {
    console.error('❌ Error checking role assignments:', error.message);
    exitCode = 1;
  } finally {
    await pool.end();
    console.log('\n' + (exitCode === 0 ? '✅ CI check PASSED' : '❌ CI check FAILED'));
    process.exit(exitCode);
  }
}

// Run the check
checkRoleAssignments().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
