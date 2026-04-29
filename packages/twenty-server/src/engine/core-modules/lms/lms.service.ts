import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { LMSCourseEntity, LMSEnrollmentEntity, RetentionQuizEntity, EnrollmentStatus, CourseStatus } from './lms.entity';

@Injectable()
export class LMSService {
  constructor(
    @InjectRepository(LMSCourseEntity) private readonly courseRepo: Repository<LMSCourseEntity>,
    @InjectRepository(LMSEnrollmentEntity) private readonly enrollRepo: Repository<LMSEnrollmentEntity>,
    @InjectRepository(RetentionQuizEntity) private readonly quizRepo: Repository<RetentionQuizEntity>,
  ) {}

  async createCourse(workspaceId: string, data: Partial<LMSCourseEntity>): Promise<LMSCourseEntity> {
    const minutes = data.modules?.reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + l.durationMinutes, 0), 0) ?? 0;
    return this.courseRepo.save(this.courseRepo.create({ workspaceId, estimatedMinutes: minutes, ...data }));
  }

  async enrollUser(courseId: string, userId: string): Promise<LMSEnrollmentEntity> {
    const existing = await this.enrollRepo.findOne({ where: { courseId, userId } });
    if (existing) return existing;
    await this.courseRepo.increment({ id: courseId }, 'enrollmentCount', 1);
    return this.enrollRepo.save(this.enrollRepo.create({ courseId, userId }));
  }

  async autoEnrollByRole(workspaceId: string, userId: string, role: string): Promise<LMSEnrollmentEntity[]> {
    const courses = await this.courseRepo.find({ where: { workspaceId, status: CourseStatus.PUBLISHED } });
    const matching = courses.filter((c) => c.requiredForRoles?.includes(role));
    const enrollments: LMSEnrollmentEntity[] = [];
    for (const course of matching) { enrollments.push(await this.enrollUser(course.id, userId)); }
    return enrollments;
  }

  async updateProgress(enrollmentId: string, moduleIndex: number, lessonIndex: number, timeSpent: number): Promise<LMSEnrollmentEntity> {
    const e = await this.enrollRepo.findOne({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    e.currentModuleIndex = moduleIndex; e.currentLessonIndex = lessonIndex;
    e.timeSpentMinutes += timeSpent; e.status = EnrollmentStatus.IN_PROGRESS;
    const course = await this.courseRepo.findOne({ where: { id: e.courseId } });
    if (course?.modules) {
      const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
      const completedLessons = course.modules.slice(0, moduleIndex).reduce((s, m) => s + m.lessons.length, 0) + lessonIndex;
      e.progressPercent = totalLessons ? (completedLessons / totalLessons) * 100 : 0;
    }
    return this.enrollRepo.save(e);
  }

  async submitQuiz(enrollmentId: string, score: number): Promise<LMSEnrollmentEntity> {
    const e = await this.enrollRepo.findOne({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    e.quizScore = score;
    if (score >= 70) {
      e.status = EnrollmentStatus.COMPLETED; e.completedAt = new Date(); e.progressPercent = 100; e.pointsEarned = Math.round(score);
      const course = await this.courseRepo.findOne({ where: { id: e.courseId } });
      if (course) {
        course.completionCount++; course.avgScore = (course.avgScore * (course.completionCount - 1) + score) / course.completionCount;
        await this.courseRepo.save(course);
        if (course.certificationExpiryDays) {
          e.certificationExpiry = new Date(Date.now() + course.certificationExpiryDays * 86_400_000);
        }
      }
      for (const days of [30, 60, 90]) {
        await this.quizRepo.save(this.quizRepo.create({ courseId: e.courseId, userId: e.userId, daysAfterCompletion: days, scheduledDate: new Date(Date.now() + days * 86_400_000) }));
      }
    } else { e.status = EnrollmentStatus.FAILED; }
    return this.enrollRepo.save(e);
  }

  async getDueRetentionQuizzes(userId: string): Promise<RetentionQuizEntity[]> {
    return this.quizRepo.find({ where: { userId, completed: false, scheduledDate: LessThan(new Date()) } });
  }

  async getManagerDashboard(workspaceId: string, managerTeamIds: string[]): Promise<Array<{ userId: string; coursesCompleted: number; avgScore: number; totalTime: number }>> {
    const results: Array<{ userId: string; coursesCompleted: number; avgScore: number; totalTime: number }> = [];
    for (const userId of managerTeamIds) {
      const enrollments = await this.enrollRepo.find({ where: { userId } });
      const completed = enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED);
      results.push({
        userId, coursesCompleted: completed.length,
        avgScore: completed.length ? completed.reduce((s, e) => s + (e.quizScore ?? 0), 0) / completed.length : 0,
        totalTime: enrollments.reduce((s, e) => s + e.timeSpentMinutes, 0),
      });
    }
    return results;
  }

  async getTrainingROI(workspaceId: string): Promise<{ totalEnrollments: number; completionRate: number; avgScore: number }> {
    const courses = await this.courseRepo.find({ where: { workspaceId } });
    const totalEnrollments = courses.reduce((s, c) => s + c.enrollmentCount, 0);
    const totalCompletions = courses.reduce((s, c) => s + c.completionCount, 0);
    return {
      totalEnrollments, completionRate: totalEnrollments ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
      avgScore: courses.length ? Math.round(courses.reduce((s, c) => s + c.avgScore, 0) / courses.length) : 0,
    };
  }
}
