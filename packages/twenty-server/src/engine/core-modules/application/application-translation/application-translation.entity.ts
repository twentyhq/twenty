import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { type APP_LOCALES } from 'twenty-shared/translations';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Entity({ name: 'applicationTranslation', schema: 'core' })
@Index(
  'IDX_APPLICATION_TRANSLATION_REGISTRATION_LOCALE_UNIQUE',
  ['applicationRegistrationId', 'locale'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class ApplicationTranslationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  applicationRegistrationId: string | null;

  @ManyToOne(() => ApplicationRegistrationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity> | null;

  @Column({ type: 'text' })
  locale: keyof typeof APP_LOCALES;

  @Column({ type: 'jsonb', default: {} })
  messages: Record<string, string>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
