import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

@Entity('indexFieldMetadata')
export class IndexFieldMetadataEntity
  implements Required<IndexFieldMetadataEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  indexMetadataId: string;

  @ManyToOne(
    () => IndexMetadataEntity,
    (indexMetadata) => indexMetadata.indexFieldMetadatas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  indexMetadata: Relation<IndexMetadataEntity>;

  @Column({ nullable: false })
  @Index('IDX_INDEX_FIELD_METADATA_FIELD_METADATA_ID', ['fieldMetadataId'])
  fieldMetadataId: string;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.indexFieldMetadatas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: false })
  order: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
