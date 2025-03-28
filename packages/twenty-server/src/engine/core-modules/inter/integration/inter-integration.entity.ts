import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'interIntegration', schema: 'core' })
@ObjectType('InterIntegration')
export class InterIntegration {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false })
  integrationName: string;

  @Field()
  @Column({ nullable: false })
  clientId: string;

  @Field()
  @Column({ nullable: false })
  clientSecret: string;

  @Field()
  @Column({ type: 'text', nullable: false })
  privateKey: string; // Armazenaremos o conteúdo do arquivo

  @Field()
  @Column({ type: 'text', nullable: false })
  certificate: string; // Armazenaremos o conteúdo do arquivo

  @Field({ defaultValue: 'active' })
  @Column({ default: 'active' })
  status: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  expirationDate?: Date;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;
}
