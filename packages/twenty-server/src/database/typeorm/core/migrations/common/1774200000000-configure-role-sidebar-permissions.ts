import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Configures showInSidebar per role so that non-layout users see only the
 * objects relevant to their role. This replaces the previous hardcoded
 * frontend list with a permission-driven approach.
 *
 * Desired sidebar visibility:
 *   Admin / function roles: showAllObjectsInSidebar = true (unchanged)
 *   Member:   person, policy, note, task
 *   Managers: person, call, policy, note, task
 *   Investor: policy only
 */
export class ConfigureRoleSidebarPermissions1774200000000
  implements MigrationInterface
{
  name = 'ConfigureRoleSidebarPermissions1774200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper: for a given role (by universalIdentifier), set showInSidebar
    // on all its objectPermission rows. Objects in the allow-list get true,
    // all others get false.
    const configureSidebar = async (
      roleUniversalId: string,
      allowedObjects: string[],
    ) => {
      // Set showInSidebar = false for all non-system object permissions
      await queryRunner.query(
        `UPDATE core."objectPermission" op
         SET "showInSidebar" = false
         FROM core."role" r
         WHERE op."roleId" = r.id
           AND r."universalIdentifier" = $1`,
        [roleUniversalId],
      );

      if (allowedObjects.length === 0) return;

      // Set showInSidebar = true for the allowed objects
      await queryRunner.query(
        `UPDATE core."objectPermission" op
         SET "showInSidebar" = true
         FROM core."role" r, core."objectMetadata" om
         WHERE op."roleId" = r.id
           AND op."objectMetadataId" = om.id
           AND r."universalIdentifier" = $1
           AND om."nameSingular" = ANY($2)`,
        [roleUniversalId, allowedObjects],
      );
    };

    // Member: Leads, Policies, Notes, Tasks
    await configureSidebar('7d0c6e61-185b-429d-bcb6-180f3751714e', [
      'person',
      'policy',
      'note',
      'task',
    ]);

    // Managers: Leads, Calls, Policies, Notes, Tasks
    await configureSidebar('2fde79e7-f734-4b0d-a8e8-9fbbd59363fd', [
      'person',
      'call',
      'policy',
      'note',
      'task',
    ]);

    // Investor: Policies only
    await configureSidebar('a13b7c32-5e4e-42eb-acf4-66523a1a6aa7', [
      'policy',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reset showInSidebar to null (let role.showAllObjectsInSidebar decide)
    const roleUniversalIds = [
      '7d0c6e61-185b-429d-bcb6-180f3751714e', // Member
      '2fde79e7-f734-4b0d-a8e8-9fbbd59363fd', // Managers
      'a13b7c32-5e4e-42eb-acf4-66523a1a6aa7', // Investor
    ];

    for (const roleUniversalId of roleUniversalIds) {
      await queryRunner.query(
        `UPDATE core."objectPermission" op
         SET "showInSidebar" = null
         FROM core."role" r
         WHERE op."roleId" = r.id
           AND r."universalIdentifier" = $1`,
        [roleUniversalId],
      );
    }
  }
}
