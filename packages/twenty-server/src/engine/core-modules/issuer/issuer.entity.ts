import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'issuer', schema: 'core' })
@ObjectType('Issuer')
@Index(['cnpj', 'workspace'], { unique: true }) // Assuming CNPJ should be unique per workspace
export class Issuer {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: false })
  name: string;

  @Field(() => String)
  @Column({ nullable: false })
  cnpj: string; // Cadastro Nacional da Pessoa Jurídica

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  cpf?: string; // Cadastro de Pessoas Físicas (if applicable)

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  ie?: string; // Inscrição Estadual

  @Field(() => String, { nullable: true })
  @Column({ name: 'cnae_code', nullable: true })
  cnaeCode?: string; // Código Nacional de Atividade Econômica

  @Field(() => String)
  @Column({ nullable: false })
  cep: string; // Código de Endereçamento Postal

  @Field(() => String)
  @Column({ nullable: false })
  street: string;

  @Field(() => String)
  @Column({ nullable: false })
  number: string;

  @Field(() => String)
  @Column({ nullable: false })
  neighborhood: string;

  @Field(() => String)
  @Column({ nullable: false })
  city: string;

  @Field(() => String)
  @Column({ nullable: false })
  state: string; // Consider using an enum in the future if you have a fixed list of states

  @Field(() => String)
  @Column({ name: 'tax_regime', nullable: false })
  taxRegime: string; // Consider using an enum: "Simples Nacional", "Lucro Presumido", "Lucro Real"

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE', nullable: false })
  workspace: Relation<Workspace>;
}
