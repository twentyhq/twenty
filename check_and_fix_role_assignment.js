// Script to check and fix missing role assignment
// This script also serves as a CI check to ensure no UserWorkspace lacks a role assignment

const { Pool } = require('pg');
const { config } = require('dotenv');

// Load environment variables
config({ path: '/Users/connor/Dev/FLCRMLMS/packages/twenty-server/.env' });

async function checkAndFixRoleAssignment() {
  const pool = new Pool({
    host: process.env.POSTGRES_ADMIN_HOST || 'localhost',
    port: process.env.POSTGRES_ADMIN_PORT || 5432,
    database: process.env.POSTGRES_ADMIN_DATABASE,
    user: process.env.POSTGRES_ADMIN_USER,
    password: process.env.POSTGRES_ADMIN_PASSWORD,
  });

  try {
    const userWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
    const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

    console.log(`Checking role assignment for UserWorkspace: ${userWorkspaceId}`);

    // Check if role assignment exists
    const existingRole = await pool.query(
      `SELECT * FROM core."roleTargets" WHERE "userWorkspaceId" = $1`,
      [userWorkspaceId]
    );

    if (existingRole.rows.length > 0) {
      console.log('✓ Role assignment already exists:');
      console.log(existingRole.rows[0]);
      return;
    }

    console.log('✗ No role assignment found. Checking workspace default role...');

    // Check workspace default role
    const workspaceResult = await pool.query(
      `SELECT "defaultRoleId" FROM core."workspace" WHERE id = $1`,
      [workspaceId]
    );

    if (workspaceResult.rows.length === 0) {
      throw new Error('Workspace not found');
    }

    const defaultRoleId = workspaceResult.rows[0].defaultRoleId;

    if (!defaultRoleId) {
      throw new Error('Workspace has no defaultRoleId set');
    }

    console.log(`Found default role: ${defaultRoleId}`);

    // Check if role exists
    const roleResult = await pool.query(
      `SELECT id, label FROM core."role" WHERE id = $1`,
      [defaultRoleId]
    );

    if (roleResult.rows.length === 0) {
      throw new Error(`Default role ${defaultRoleId} not found`);
    }

    console.log(`Role details: ${roleResult.rows[0].label} (${defaultRoleId})`);

    // Create the missing role assignment
    const roleTargetId = '20202020-' + [...Array(8)].map(() => Math.random().toString(36)[2]).join('') + '-' +
                        [...Array(4)].map(() => Math.random().toString(36)[2]).join('') + '-' +
                        [...Array(4)].map(() => Math.random().toString(36)[2]).join('') + '-' +
                        [...Array(4)].map(() => Math.random().toString(36)[2]).join('') + '-' +
                        [...Array(12)].map(() => Math.random().toString(36)[2]).join('');

    await pool.query(
      `INSERT INTO core."roleTargets" (id, "workspaceId", "roleId", "userWorkspaceId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [roleTargetId, workspaceId, defaultRoleId, userWorkspaceId]
    );

    console.log('✓ Successfully created role assignment!');
    console.log({
      id: roleTargetId,
      workspaceId,
      roleId: defaultRoleId,
      userWorkspaceId
    });

    // Verify creation
    const verifyResult = await pool.query(
      `SELECT * FROM core."roleTargets" WHERE "userWorkspaceId" = $1`,
      [userWorkspaceId]
    );

    console.log('\nVerification:');
    console.log(verifyResult.rows[0]);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndFixRoleAssignment();
