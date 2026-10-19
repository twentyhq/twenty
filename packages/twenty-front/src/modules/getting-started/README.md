# Getting started

The page implements the six actions from the [Figma design](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=119829-19810): mailbox connection, spreadsheet import, app installation, team invitations, deal handover, and closing-deal follow-ups.

## Product behavior

- Progress, card selection and snooze are saved for each user in each workspace. Skip selects the next unfinished card without completing the current one. Every card remains directly selectable.
- A successful synchronous event completes a step: connected mailbox, parsed spreadsheet upload, accepted app-install job, sent invitation, activated workflow, or accepted AI request. Background sync, import, app installation and AI execution can still continue or fail independently.
- Existing connected mailboxes, listed workspace apps, and published personal handover templates are recognized. Import and invitation hooks also record actions performed elsewhere before visiting this page. Pre-release uploads and invitations lack reliable per-user history and are not guessed; deleted resources cannot be reconstructed.
- The amber countdown uses the current trial end. Registering a payment method changes the heading to “Finish your setup.” Keep Pro opens the existing billing settings.
- Snooze affects automatic navigation on the next app landing, never sends messages, and keeps manual sidebar access available. Tomorrow means midnight at the start of the next date in the user's timezone; the final-three-days option means exactly 72 hours before trial expiry. Past deadlines are disabled. Hide for good is omitted.
- Credits use the existing workspace ledger and configured reward amounts/caps. The total is earned credit, without an additional completion bonus. Mailbox reward retains workspace-creator eligibility and one grant per workspace; invitations grant on send, with email-based deduplication across resend and acceptance and compatibility with legacy user-based grants.
- Handover creates a reusable draft for the current user. It responds to a change to the standard won stage (`CUSTOMER`), finds the linked company's account owner, creates a kickoff task and sends the owner an email using the user's connected mailbox. Edit draft opens the existing workflow editor. Workspaces with custom stages or ownership conventions can edit the draft before activation.
- The follow-up card submits its editable prompt and optional attachments to the existing AI chat and opens that conversation. Completion acknowledges the request, not a guarantee that a recurring automation has finished being configured.
- Existing permissions and provider availability govern each action. No new emails are sent by snoozing or completing the checklist itself.

## Extending the steps

Add a stable ID to `GETTING_STARTED_STEPS` in twenty-shared, add display content to `GETTING_STARTED_STEP_CONTENT`, and register its action component and permission in `GettingStartedPage`. Record its synchronous completion through `useUpdateGettingStarted` or `GettingStartedService.completeStep`. Counts, navigation, input validation and completion automatically use the shared registry. Keep reward issuance in the authoritative action service; the progress mutation cannot grant credits.

## Validation

Focused tests cover navigation, local-calendar/DST snooze behavior, workspace/user scoping, durable completion, ledger totals, invitation reward keys/caps, mailbox reward after a skipped onboarding step, handover retries/failure, workflow structure and stage transitions, and frontend GraphQL documents against a Nest-generated schema. Storybook states cover trial, registered payment method, completed mailbox, all done, loading and error.

Live OAuth, actual email delivery, app install workers, billing and AI providers require a configured development workspace. The isolated browser preview verifies the real page layout with fixture data; it is not a live end-to-end integration test.
