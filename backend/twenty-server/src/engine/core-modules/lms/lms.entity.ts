import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CourseStatus { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }
export enum EnrollmentStatus { ENROLLED = 'enrolled', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', FAILED = 'failed' }
export enum CourseAudience { INTERNAL = 'internal', CUSTOMER = 'customer', PARTNER = 'partner' }

@Entity('lms_course')
@Index(['workspaceId', 'status'])
export class LMSCourseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.DRAFT }) status: CourseStatus;
  @Column({ type: 'enum', enum: CourseAudience, default: CourseAudience.INTERNAL }) audience: CourseAudience;
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'simple-json', nullable: true }) modules: Array<{
    title: string; lessons: Array<{ title: string; type: string; contentUrl?: string; durationMinutes: number }>;
    quiz?: Array<{ question: string; options: string[]; correctIndex: number }>;
  }>;
  @Column({ type: 'int', default: 0 }) estimatedMinutes: number;
  @Column({ type: 'simple-array', nullable: true }) requiredForRoles: string[];
  @Column({ type: 'int', nullable: true }) certificationExpiryDays: number;
  @Column({ type: 'int', default: 0 }) enrollmentCount: number;
  @Column({ type: 'int', default: 0 }) completionCount: number;
  @Column({ type: 'float', default: 0 }) avgScore: number;
  @CreateDateColumn() createdAt: Date;
}

@Entity('lms_enrollment')
@Index(['courseId', 'userId'])
export class LMSEnrollmentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) courseId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ENROLLED }) status: EnrollmentStatus;
  @Column({ type: 'float', default: 0 }) progressPercent: number;
  @Column({ type: 'int', default: 0 }) timeSpentMinutes: number;
  @Column({ type: 'float', nullable: true }) quizScore: number;
  @Column({ type: 'int', default: 0 }) currentModuleIndex: number;
  @Column({ type: 'int', default: 0 }) currentLessonIndex: number;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;
  @Column({ type: 'date', nullable: true }) certificationExpiry: Date;
  @Column({ type: 'int', default: 0 }) pointsEarned: number;
  @CreateDateColumn() enrolledAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('retention_quiz')
@Index(['userId'])
export class RetentionQuizEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) courseId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'int', nullable: false }) daysAfterCompletion: number;
  @Column({ type: 'float', nullable: true }) score: number;
  @Column({ type: 'boolean', default: false }) completed: boolean;
  @Column({ type: 'date', nullable: false }) scheduledDate: Date;
  @CreateDateColumn() createdAt: Date;
}
