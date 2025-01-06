import { Field, ObjectType } from '@nestjs/graphql';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity({ name: 'permission', schema: 'core' })
@ObjectType('Permission')
export class Permission {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  tableName: string; 

  @Field()
  @Column({ default: false })
  canCreate: boolean;

  @Field()
  @Column({ default: false })
  canEdit: boolean;

  @Field()
  @Column({ default: false })
  canView: boolean;

  @Field()
  @Column({ default: false })
  canDelete: boolean;

  @Field(() => Role)
  @ManyToOne(() => Role, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<Role>;

  @Field({ nullable: false })
  @Column()
  roleId: string;

}