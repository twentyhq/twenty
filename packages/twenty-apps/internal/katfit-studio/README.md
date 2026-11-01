# KATFIT Studio

Internal Twenty application for KATFIT BALANCE CRM operations.

[Каталог фич](docs/features/README.md) — возможности приложения, правила,
ограничения и подтверждённые статусы выпуска.

## Lead contour (implemented in code)

```text
Landing form → PostgreSQL leads → telegram-lead-notifier
  ├─ Telegram alert (supergroup + inline keyboard + deep-link)
  └─ POST /s/studio/leads (WF-01)
        → Person + Opportunity (WAITLIST) + Task «Написать клиенту» (due +2h)

Telegram buttons / reply / secretary
  └─ POST /s/studio/lead-actions
        → Note + stage / lifecycle / tasks (see docs/lead-actions.md)

Telegram resend card (ID36 / /resend)
  └─ POST /s/studio/lead-status
        → stage + channel + notes history (see docs/lead-status.md)
```

Manager lists in Opportunities: **Новые лиды**, **Нарушение SLA**, **Воронка первой покупки**, **Связались — ждут intro**, **Intro без покупки**.

Apply to a workspace (`twenty plan` / `apply`) and enable `CRM_SYNC_ENABLED` on the poller before this appears in production UI.

## Also in 0.1.0+

- Person lifecycle, lead source / last-touch, lead timestamps, landing ID, consents, full UTM, preferred channel, **lastContactChannel**, formats, time bands, next action.
- Opportunity pipeline fields (stage, SLA timestamps, lead/UTM snapshots, lost reason).
- WF-01 ingest + **LeadAction API** (`studio-lead-actions`) + **LeadStatus API** (`studio-lead-status`) for Telegram ops-bot.
- Products, groups, sessions, bookings, memberships, payments, make-up credits and relations.
- Pair records and the relations required for a shared split block and two client bookings.
- Five active base products: group single visit, group packages of 4/8 visits,
  and personal single visit/package of 8 visits.
- Package payment command: paid Payment + active Membership + idempotent GRANT transaction and visit balance.
- Past attendance command: completed ClassSession + attended Booking + idempotent CONSUME transaction and reconciled visit balance.

The attendance command resumes an interrupted operation when called with the same key. The SDK does not provide a transaction spanning CRM records: a failed intermediate mutation may leave a session or booking until retry completes it. The unique consumption sequence prevents two concurrent commands from consuming the same visit, but this flow still needs a transactional server-side write path before it can guarantee all-or-nothing behavior.
- Default application function role.

Not in this app yet: refunds and balance corrections, WF-02 SLA cron, WF-03 Telegram-from-CRM (outbound stays in poller), and transactional server-side writes for concurrent booking safety.

Split contract: [docs/split-implementation-brief.ru.md](docs/split-implementation-brief.ru.md). The Pair data model, split sale, future booking, attendance and cancellation commands are available. Review the generated plan and run integration tests with a workspace database before production use.

Contracts: [docs/lead-actions.md](docs/lead-actions.md), [docs/lead-status.md](docs/lead-status.md).

User guide: [Календарь занятий](docs/training-calendar-guide.ru.md).

Operator instructions: [Оформление оплаты пакета](docs/instructions/confirm-package-payment.ru.md), [внесение прошедшего занятия](docs/instructions/record-past-attendance.ru.md).

Split operator instruction: [Работа со сплитами](docs/instructions/split-workflow.ru.md).
QA: [Позитивный тест-кейс сплита](docs/instructions/split-positive-test-case.ru.md).

## Validate

```bash
yarn install
yarn typecheck
yarn lint
yarn test:unit
yarn twenty dev:build
```

## Deploy safely

```bash
yarn twenty remote:add
yarn twenty plan
yarn twenty apply
```

Do not apply to production before reviewing the plan and backing up the workspace.

Contract: `docs/katfit-balance-crm-technical-spec.ru.md` (repo root `crm-twenty`).
Manager guide: `docs/katfit-balance-crm-manager-guide.ru.md`.

## Trainer compensation

Configurable group compensation for 1–4 actual attendees, published rate snapshots and dated trainer assignments. Closing a class records one expense with the complete attendance/rate/consumption snapshot. Corrections append a reversal and replacement; a trainer report summarizes the latest completed revisions. Session write locks serialize closing with existing booking and attendance commands.

Configuration and operator guide: [Оплата тренеров](docs/instructions/trainer-compensation.ru.md). Deployed and verified on stage on 2026-10-29; see [stage QA](docs/stage-trainer-compensation-qa-2026-10-29/report.ru.md). Actual staff, rates and workspace permissions still require configuration; synthetic QA trainers are inactive. Authenticated tariff publication and closing currently share the application access level.

Trainer directory is available in application navigation with class, accrual and rate-assignment tabs. The schedule supports choosing one trainer at creation or editing; existing classes also have an audited assignment command. Payroll defaults to the assigned trainer, and its period report is available from the trainer card.

## Client training activity

Automatic `trainingActivity` on Person tracks recent attendance and future/current
bookings independently of lifecycle and sales stages. Booking/session events
recompute affected clients; daily reconciliation backfills existing clients and
pauses former attendees after more than 14 days without attendance or upcoming
bookings. See [Активность занятий](docs/training-activity.ru.md).
