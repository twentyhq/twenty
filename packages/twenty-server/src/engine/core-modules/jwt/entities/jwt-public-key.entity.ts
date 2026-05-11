import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type JwtPublicKeyAlgorithm = 'ES256';

export type JwtPublicKeyStatus = 'active' | 'retired';

@Entity({ name: 'jwtPublicKey', schema: 'core' })
@Index('IDX_JWT_PUBLIC_KEY_KID_UNIQUE', ['kid'], { unique: true })
export class JwtPublicKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  kid: string;

  @Column({ type: 'text' })
  publicKey: string;

  @Column({ type: 'varchar', length: 32, default: 'ES256' })
  algorithm: JwtPublicKeyAlgorithm;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: JwtPublicKeyStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
