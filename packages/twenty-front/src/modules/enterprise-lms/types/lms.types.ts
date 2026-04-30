export type CourseStatus = 'draft' | 'published' | 'archived';

export type CourseData = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  duration: string;
  enrollmentCount: number;
  completionRate: number;
  isMandatory: boolean;
};

export type EnrollmentData = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'overdue';
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string;
  dueDate?: string;
};

export type ComplianceItem = {
  id: string;
  certificationName: string;
  userName: string;
  department: string;
  expiresAt: string;
  status: 'valid' | 'expiring_soon' | 'expired';
};
