# Learning Management System (LMS)

Course management with modular lessons, quizzes, role-based auto-enrollment, retention quizzes, certification tracking, and compliance reporting.

## Entities
- `LMSCourseEntity` — title, status, audience (internal/customer/partner), modules (lessons + quizzes), estimatedMinutes, requiredForRoles, certificationExpiryDays, avgScore
- `LMSEnrollmentEntity` — courseId, userId, status, progressPercent, quizScore, certificationExpiry, pointsEarned
- `RetentionQuizEntity` — courseId, userId, daysAfterCompletion (30/60/90), score, scheduledDate

## Service Methods
- `createCourse(workspaceId, data)` — creates course with auto-calculated duration
- `enrollUser(courseId, userId)` — enrolls user in course
- `autoEnrollByRole(workspaceId, userId, role)` — auto-enrolls in role-required courses
- `updateProgress(enrollmentId, moduleIndex, lessonIndex, timeSpent)` — tracks lesson progress
- `submitQuiz(enrollmentId, score)` — grades quiz; 70+ = pass; schedules retention quizzes at 30/60/90 days
- `getDueRetentionQuizzes(userId)` — pending retention quizzes
- `getManagerDashboard(workspaceId, teamIds)` — team training progress
- `getTrainingROI(workspaceId)` — enrollments, completion rate, avg score
- `getCourseCatalog(workspaceId, audience)` — published course catalog
- `getComplianceStatus(workspaceId)` — overdue compliance training
- `correlateTrainingWithPerformance(workspaceId)` — training vs performance metrics

## Feature Flag
`IS_MODULE_LMS_ENABLED`

## Dependencies
- None
