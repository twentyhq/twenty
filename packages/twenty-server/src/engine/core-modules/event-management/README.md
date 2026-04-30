# Event Management

CRM event management with registration, QR check-in, session tracking, waitlist management, ROI calculation, and event cloning.

## Entities
- `CRMEventEntity` — name, format (in_person/virtual/hybrid), startDate, endDate, location, streamingUrl, capacity, registrationCount, attendeeCount, budget, actualCost, leadsGenerated, dealsCreated, revenueAttributed, sessions, sponsors
- `EventRegistrationEntity` — eventId, contactId, status, qrCode, checkedInAt, sessionsAttended, scoreEarned

## Service Methods
- `createEvent(workspaceId, data)` — creates event
- `registerAttendee(eventId, contactId)` — registers attendee with QR code or waitlist
- `checkIn(registrationId)` — marks attendance, increments event count
- `checkInByQR(qrCode)` — check-in via QR code scan
- `recordSessionAttendance(registrationId, sessionName, points)` — tracks session attendance + points
- `promoteWaitlist(eventId)` — promotes waitlisted attendees when capacity opens
- `getROI(eventId)` — cost, leads, deals, revenue, ROI percentage
- `cloneEvent(eventId, newStartDate)` — clones event with reset counters

## Feature Flag
`IS_MODULE_EVENTS_ENABLED`

## Dependencies
- None
