# HRM & Payroll

Human resource management with employee lifecycle, recruitment, Colombian payroll (health/pension/tax deductions), performance reviews, leave management, satisfaction surveys, and workforce analytics.

## Entities
- `EmployeeEntity` — fullName, position, department, managerId, status, baseSalary, currency (COP), skills, vacationDays, documents
- `RecruitmentCandidateEntity` — fullName, position, stage (application->hired), rating, resumeFileId
- `PayrollRecordEntity` — employeeId, period, baseSalary, overtime, commissions, bonuses, healthDeduction, pensionDeduction, taxWithholding, netPay
- `PerformanceReviewEntity` — employeeId, reviewerId, cycle, competencies, goals, overallRating
- `LeaveRequestEntity` — employeeId, type, startDate, endDate, days, status, approverId
- `EmployeeSatisfactionEntity` — employeeId, score, feedback, department

## Service Methods
- `createEmployee(workspaceId, data)` — creates employee record
- `getOrgChart(workspaceId)` — organizational hierarchy
- `terminateEmployee(employeeId)` — terminates employee
- `createCandidate(workspaceId, data)` — adds recruitment candidate
- `hireCandidate(workspaceId, candidateId, salary)` — converts candidate to employee
- `calculatePayroll(workspaceId, employeeId, period, extras)` — Colombian payroll with 4% health/pension, 7% tax
- `generatePayslip(workspaceId, employeeId, period)` — detailed payslip
- `requestLeave(workspaceId, data)` — submits leave request
- `approveLeave(leaveId, approverId)` — approves leave, deducts vacation days
- `getENPS(workspaceId)` — employee Net Promoter Score
- `calculateTurnover(workspaceId, startDate, endDate)` — turnover rate
- `getHeadcountByDepartment(workspaceId)` — headcount and avg salary by dept
- `generateOnboardingChecklist(workspaceId, employeeId)` — onboarding tasks

## Feature Flag
`IS_MODULE_HRM_ENABLED`

## Dependencies
- None
