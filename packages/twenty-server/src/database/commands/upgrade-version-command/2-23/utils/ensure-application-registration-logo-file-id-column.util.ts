type QueryExecutor = (sql: string) => Promise<unknown>;

// Verbatim copy of the 2.21 add-logo-file-id-to-application-registration DDL.
// Kept in one place so the 2.23 repair (workspace command + fast instance
// command) and the original migration stay byte-for-byte identical.
export const ensureApplicationRegistrationLogoFileIdColumn = async (
  query: QueryExecutor,
): Promise<void> => {
  await query(
    'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "logoFileId" uuid',
  );
  await query(
    'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "UQ_796819fb23559c233e6ebd49f34"',
  );
  await query(
    'ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "UQ_796819fb23559c233e6ebd49f34" UNIQUE ("logoFileId")',
  );
  await query(
    'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "FK_796819fb23559c233e6ebd49f34"',
  );
  await query(
    'ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "FK_796819fb23559c233e6ebd49f34" FOREIGN KEY ("logoFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
  );
};

export const dropApplicationRegistrationLogoFileIdColumn = async (
  query: QueryExecutor,
): Promise<void> => {
  await query(
    'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "FK_796819fb23559c233e6ebd49f34"',
  );
  await query(
    'ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "UQ_796819fb23559c233e6ebd49f34"',
  );
  await query(
    'ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "logoFileId"',
  );
};
