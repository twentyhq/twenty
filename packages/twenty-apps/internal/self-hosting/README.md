# Self Hosting

The Self Hosting app collects sign-up telemetry from self-hosted Twenty instances and turns it into structured CRM records. Each time a user signs up on a self-hosted instance, the app records who they are, which instance they belong to, and automatically links them to a matching Person in your workspace.

## What it does

- Receives sign-up events from self-hosted instances through a public telemetry webhook.
- Creates or updates a **Self Hosting User** record for each real sign-up, keyed by email address.
- Automatically matches every Self Hosting User to an existing Person by email, creating a new Person when none is found, and keeps that link up to date as the data changes.
- Filters out test and example sign-ups so they never enter your CRM.
- Carries a rich set of person and company enrichment fields so each sign-up can be augmented with firmographic data.

## What it adds to your workspace

### Self Hosting User object

A new object, **Self Hosting Users**, stores one record per self-hosted sign-up. Its fields include:

- **Identity**: Name, Email, Domain, Locale. The webhook only populates Name, Email, and Locale; Domain exists on the object but is not filled in by the sign-up flow.
- **Instance**: Server URL, Server ID, User ID, User Workspace ID.
- **Relations**: Person, the matched standard Person record for this user.
- **Aggregate**: Number of Emails with Same Domain, a count of users sharing the same business domain. This field is part of the data model but is not populated by the app's own ingestion or matching logic.
- **Enrichment state**: Is Enriched, Tried To Be Enriched, Is Personal Email, Is Twenty.
- **Person enrichment**: City, Country, Job Function, Job Title, LinkedIn, Seniority.
- **Company enrichment**: Name, Description, Industry, Industries, Employees, Founded Year, Annual Revenue, Funding Latest Stage, Funding Total Amount, Alexa Rank, LinkedIn, Tags, Tech.

### Person relation

The standard **Person** object gains a **Self hosting users** relation, so you can see every self-hosted sign-up tied to a given person directly from their record.

### View and navigation

A **Self hosting users** table view exposes all of the fields above as columns and is added to the left sidebar for quick access.

### Role

The app ships a default role with read, update, and soft-delete permissions over workspace records. Permanent deletion is not granted.

## How sign-up data flows in

The app exposes an unauthenticated HTTP endpoint that self-hosted instances post telemetry to:

- **Method**: `POST`
- **Path**: `/webhook/telemetry`

A request is processed only when its `action` is `user_signup`; any other event type is acknowledged and ignored. The payload carries the user's email, first and last name, locale, the originating server URL and server ID, and workspace identifiers.

When a valid sign-up arrives:

1. Non-signup events are acknowledged and ignored first; then sign-ups with no email are skipped; then sign-ups whose email contains `test` or `example` (case-insensitive) are ignored.
2. If a Self Hosting User already exists for that email, it is updated with the latest details; otherwise a new one is created. The app persists Name, Email, Locale, Server URL, Server ID, User ID, and User Workspace ID; Domain and the enrichment fields are left for separate processes.
3. Whenever a Self Hosting User is created or its email changes, the app looks for a Person with the same email. If one exists it links them; if not, it creates a Person and links it. Records that already have a matched Person and an unchanged email are left untouched.

## Configuration

This app requires no server or application variables. To send data into it, point a self-hosted Twenty instance's telemetry at the webhook path above on the workspace where this app is installed.

## Limitations

- The telemetry webhook is intentionally **unauthenticated** and performs no signature or shared-secret verification. Any client that can reach the endpoint can submit sign-up events, so it should only be exposed to trusted self-hosted instances.
- Test/example filtering is a simple substring match: any email containing `test` or `example` anywhere is excluded, even if it is a legitimate address.
- The enrichment fields and the Domain field are part of the data model but are populated by separate processes; the app itself ingests sign-ups and performs Person matching.
