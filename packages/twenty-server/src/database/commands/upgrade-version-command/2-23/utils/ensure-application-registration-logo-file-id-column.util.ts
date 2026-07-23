type QueryExecutor = (sql: string) => Promise<unknown>;

// Verbatim 2.21 add-logo-file-id DDL, shared so both 2.23 repair paths match.
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
