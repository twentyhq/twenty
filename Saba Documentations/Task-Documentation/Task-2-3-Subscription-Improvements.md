# Task 2/3 — Subscription Improvements (Enzo's Confirmed Items)

**Status:** NOT STARTED
**Assigned to:** Saba
**Confirmed by:** Enzo Becker (2026-03-15)
**Last updated:** 2026-03-16

---

## Context

Enzo confirmed 5 specific items to build next. 3 come from Briefing 01 (Task 2) remaining features, 2 come from Change Requests (Task 3). This document tracks all 5 items as one unit of work.

Enzo's exact words: "Yes, and generally speaking you can and should always go ahead with the features briefed before. In best-case you take every item mentioned from my side and keep track of everything, reporting afterwards what was done and what you think should come next."

---

## Items To Build

### 0. Create Test Subscription
**Source:** Task 3 — Change Requests, item #5 (Create test data entries)
**Why:** We need a safe test record on crm.tob.sh to test all changes without touching real subscription data.
**What to do:** Create a test subscription record with realistic field values that we can pause, modify, and verify against.
**Status:** [ ] NOT DONE

### 1. Pause Guided Workflow Rework
**Source:** Task 2 — Briefing 01, Section 3.1 #1
**Enzo's words:** "Pause Subscription-Feature needs to be changed. We need to put in days of pause period and also a reason. In best-case a pause is an own data-point. So if we add a pause to a subscription you have to put in the period and a reason and it should be logged how activated the pause, also a notes field. So after button-push in the subscription-view there should be a popup or a form to be filled out, which changes the data in the subscription after submission."
**Current state:** Fixed 4-week pause with simple confirmation dialog
**What to build:** Popup form with: pause period (days), reason, notes, who activated. Logged as own data-point.
**Status:** [ ] NOT DONE

### 2. Pause-Days Data Field
**Source:** Task 2 — Briefing 01 (Enzo's feature request 2026-03-15)
**Enzo's words:** "Pause-Days needs to be an own data-field on subscription-level"
**Current state:** Field does not exist
**What to build:** New data field on subscription object tracking pause days
**Status:** [ ] NOT DONE

### 3. Final End-Date Calculated Field
**Source:** Task 2 — Briefing 01 (Enzo's feature request 2026-03-15)
**Enzo's words:** "Final End-Date needs to be an own data-field on subscription-level which needs to be calculated"
**Enzo's correction:** "It should be period(s) bought PLUS pause periods leads to Final End-Date" (not minus)
**Current state:** Field does not exist
**What to build:** New calculated field: periods bought + pause periods = Final End-Date
**Status:** [ ] NOT DONE

### 4. Status Dropdown Width Fix
**Source:** Task 3 — Change Requests
**Enzo's words:** "Status-Field cuts the status namings; Dropdown needs to be expanded. > Saba"
**Current state:** Dropdown too narrow, long status names get cut off
**What to build:** Expand dropdown width so all status names are fully visible
**Status:** [ ] NOT DONE

### 5. Add "Unclear" Status
**Source:** Task 3 — Change Requests
**Enzo's words:** "For the start, we need to add another status unclear for every subscription we now have ingested until we know for sure what their status is"
**Current state:** Status options: Active, Not Granted, Paused, Withdrawn
**What to build:** Add "unclear" option to the status SELECT field
**Status:** [ ] NOT DONE

---

## Completion Checklist

| # | Item | Source | Status |
|---|------|--------|--------|
| 0 | Create test subscription | Change Requests | [ ] |
| 1 | Pause guided workflow (form with days, reason, notes, who) | Briefing 01 | [ ] |
| 2 | Pause-Days data field | Briefing 01 | [ ] |
| 3 | Final End-Date calculated field (periods + pauses) | Briefing 01 | [ ] |
| 4 | Status dropdown width fix | Change Requests | [ ] |
| 5 | "Unclear" status option | Change Requests | [ ] |

**All 6 items done = this task is DONE.**
