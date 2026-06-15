import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Replaces the legacy `secure` boolean with the `connectionSecurity` enum,
// preserving the previously deployed on-wire behavior exactly. SMTP used
// implicit TLS on port 465 (-> SSL_TLS) and opportunistic STARTTLS elsewhere
// (-> STARTTLS); IMAP used implicit TLS when secure (-> SSL_TLS) and
// opportunistic STARTTLS otherwise (-> STARTTLS); CalDAV is TLS over its https
// host (-> SSL_TLS). STARTTLS stays opportunistic so no account is forced onto
// a stricter handshake than it already used.
@RegisteredInstanceCommand('2.14.0', 1781461753981, { type: 'slow' })
export class BackfillConnectionSecuritySlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."connectedAccount"
       SET "connectionParameters" = jsonb_set(
         "connectionParameters" #- '{SMTP,secure}',
         '{SMTP,connectionSecurity}',
         to_jsonb(
           CASE WHEN "connectionParameters"->'SMTP'->>'port' = '465'
                THEN 'SSL_TLS' ELSE 'STARTTLS' END
         )
       )
       WHERE "connectionParameters" ? 'SMTP'
         AND NOT "connectionParameters"->'SMTP' ? 'connectionSecurity'`,
    );

    await dataSource.query(
      `UPDATE "core"."connectedAccount"
       SET "connectionParameters" = jsonb_set(
         "connectionParameters" #- '{IMAP,secure}',
         '{IMAP,connectionSecurity}',
         to_jsonb(
           CASE WHEN "connectionParameters"->'IMAP'->>'secure' = 'false'
                THEN 'STARTTLS' ELSE 'SSL_TLS' END
         )
       )
       WHERE "connectionParameters" ? 'IMAP'
         AND NOT "connectionParameters"->'IMAP' ? 'connectionSecurity'`,
    );

    await dataSource.query(
      `UPDATE "core"."connectedAccount"
       SET "connectionParameters" = jsonb_set(
         "connectionParameters" #- '{CALDAV,secure}',
         '{CALDAV,connectionSecurity}',
         to_jsonb('SSL_TLS'::text)
       )
       WHERE "connectionParameters" ? 'CALDAV'
         AND NOT "connectionParameters"->'CALDAV' ? 'connectionSecurity'`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
