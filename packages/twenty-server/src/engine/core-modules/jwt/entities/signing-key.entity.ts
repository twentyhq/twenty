import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'signingKey', schema: 'core' })
@Index('IDX_SIGNING_KEY_IS_CURRENT_UNIQUE', ['isCurrent'], {
  unique: true,
  where: '"isCurrent" = true',
})
// Signing keys are instance-scoped — the HKDF info is just "instance"
// — so the envelope shape is enforced on every non-null privateKey row.
@Check(
  'CHK_signingKey_privateKey_encrypted',
  `"privateKey" IS NULL OR "privateKey" LIKE 'enc:v2:%'`,
)
export class SigningKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  publicKey: string;

  @Column({ type: 'varchar', nullable: true })
  privateKey: string | null;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
