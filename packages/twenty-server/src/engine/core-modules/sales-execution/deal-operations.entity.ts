import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export interface SalesStageRule {
  stage: string;
  requiredFields: string[];
  allowedNextStages?: string[];
  notes?: string;
}

@Entity('sales_deal_blueprint')
@Index(['workspaceId', 'isActive'])
export class SalesDealBlueprintEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  stageRules: SalesStageRule[];

  @Column({ type: 'simple-array', nullable: true })
  requiredFields: string[];

  @CreateDateColumn()
  createdAt: Date;
}
