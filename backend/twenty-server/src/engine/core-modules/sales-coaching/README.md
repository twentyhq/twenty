# Sales Coaching

Structured sales coaching with 1:1 sessions, call reviews with skill scoring, rep scorecards, and skill gap analysis.

## Entities
- `CoachingSessionEntity` — repId, coachId, title, agenda, status (scheduled/in_progress/completed), coachNotes, repNotes, actionItems, focusAreas, overallRating
- `CallReviewEntity` — repId, reviewerId, dealId, callDate, outcome (won/lost/follow_up/demo_scheduled), talkRatio, questionsAsked, discoveryScore, objectionHandlingScore, closingScore, presentationScore, overallScore, strengths, improvements, keyMoments
- `RepScorecardEntity` — repId, aggregated performance metrics

## Service Methods
- `SalesCoachingService` — schedules coaching sessions, reviews call recordings with skill scoring (discovery/objection handling/closing/presentation), tracks rep scorecards, identifies skill gaps by category (critical/high/medium/low)

## Feature Flag
N/A (core sales module)

## Dependencies
- None
