import { ObjectType, ID, Field } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'objectCreated', schema: 'core' })
@ObjectType('ObjectCreated')
export class ObjectCreated {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column('json')
  objectData: Record<string, any>;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}

@Entity({ name: 'objectDeleted', schema: 'core' })
@ObjectType('ObjectDeleted')
export class ObjectDeleted {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column('json')
  objectData: Record<string, any>;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}

@Entity({ name: 'objectUpdated', schema: 'core' })
@ObjectType('ObjectUpdated')
export class ObjectUpdated {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column('json')
  objectData: Record<string, any>;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
