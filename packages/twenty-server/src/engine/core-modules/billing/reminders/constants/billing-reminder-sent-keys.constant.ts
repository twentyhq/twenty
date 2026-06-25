// Workspace-level user vars used to make the billing reminder cron idempotent.
// The stored value is the ISO boundary date (trialEnd / currentPeriodEnd) we last
// sent a reminder for, so a yearly renewal reminder fires again next period while the
// daily cron never sends twice for the same boundary.
export const BILLING_TRIAL_REMINDER_SENT_KEY = 'BILLING_TRIAL_REMINDER_SENT';
export const BILLING_RENEWAL_REMINDER_SENT_KEY =
  'BILLING_RENEWAL_REMINDER_SENT';

// Billing reminders link to the workspace billing settings (billing is cloud-only).
export const BILLING_REMINDER_SETTINGS_URL =
  'https://app.twenty.com/settings/billing';
