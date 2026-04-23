import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  KPI = 'kpi',
  TABLE = 'table',
  FUNNEL = 'funnel',
  HEATMAP = 'heatmap',
}

export enum DataSource {
  SALES = 'sales',
  MARKETING = 'marketing',
  SERVICE = 'service',
  CUSTOM = 'custom',
}

@Entity('dashboard_widget')
@Index(['workspaceId', 'dashboardId'])
export class DashboardWidgetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  dashboardId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: WidgetType, default: WidgetType.KPI })
  type: WidgetType;

  @Column({ type: 'enum', enum: DataSource, default: DataSource.SALES })
  dataSource: DataSource;

  @Column({ type: 'simple-json', nullable: true })
  config: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  positionX: number;

  @Column({ type: 'int', default: 0 })
  positionY: number;

  @Column({ type: 'int', default: 4 })
  width: number;

  @Column({ type: 'int', default: 3 })
  height: number;

  @Column({ type: 'simple-json', nullable: true })
  filters: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('analytics_report')
@Index(['workspaceId', 'createdAt'])
export class AnalyticsReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  metrics: string[];

  @Column({ type: 'simple-json', nullable: true })
  dimensions: string[];

  @Column({ type: 'simple-json', nullable: true })
  filters: Record<string, unknown>;

  @Column({ type: 'simple-array', nullable: true })
  chartTypes: string[];

  @Column({ type: 'boolean', default: false })
  isScheduled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  schedule: string;

  @CreateDateColumn()
  createdAt: Date;
}