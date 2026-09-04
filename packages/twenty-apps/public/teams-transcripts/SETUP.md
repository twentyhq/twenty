# Setup

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Yarn 4
- Docker (to run the local Twenty server)
- A Microsoft 365 tenant where you can register an Entra application and
  change Teams meeting settings

## Microsoft 365 configuration

1. In the Microsoft Entra admin center, register an application (single tenant)
   and create a client secret. Note the tenant ID, application (client) ID, and
   the secret value.

2. Under API permissions, add these Microsoft Graph **application** permissions
   and grant admin consent:

   - `OnlineMeetingTranscript.Read.All`
   - `OnlineMeetings.Read.All`
   - `User.Read.All`
   - `CallTranscripts.Read.All` (only needed for the upcoming ad hoc call support)

3. Authorize the app to read online meeting artifacts with an application
   access policy, using the Teams PowerShell module:

   ```powershell
   Connect-MicrosoftTeams
   New-CsApplicationAccessPolicy -Identity Twenty-Teams-Transcripts -AppIds "<application-client-id>" -Description "Twenty transcript import"
   Grant-CsApplicationAccessPolicy -PolicyName Twenty-Teams-Transcripts -Global
   ```

4. In the Teams admin center, go to Meetings, Meeting settings, Transcript API
   access, and turn on **Microsoft Graph access** and **Include speaker
   attribution**. Both are off by default. The PowerShell equivalent is:

   ```powershell
   Set-CsTeamsMeetingConfiguration -EnableGraphTranscriptAccess $true -EnableAttributedTranscripts $true -Identity Global
   ```

5. Optional but recommended: run the probe to see how many transcripts Graph
   still returns per organizer and per month.

   ```bash
   MICROSOFT_TENANT_ID=... MICROSOFT_CLIENT_ID=... MICROSOFT_CLIENT_SECRET=... \
   ORGANIZER_USER_IDS=<entra-object-id>,<entra-object-id> DAYS=365 yarn probe
   ```

## Steps

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the local Twenty server:

   ```bash
   yarn twenty docker:start
   ```

3. Set `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID` and
   `MICROSOFT_CLIENT_SECRET` as application variables in Twenty.

4. Connect the organizers' Microsoft accounts in Twenty so their calendar
   events are synced. Transcripts link to Calendar Events through the meeting
   join URL.

5. Start the development server and sync your app:

   ```bash
   yarn twenty dev
   ```

6. Import a transcript: run the **List Teams Transcripts By Organizer** action
   with an organizer's Entra object ID, then **Sync Teams Transcript** with one
   of the returned `meetingId` and `transcriptId` pairs. The Call Recording
   appears with its transcript, and the summary follows a few seconds later.

## Verifying your setup

- `yarn lint` - Lint the project with oxlint
- `yarn typecheck` - Type-check the project
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests

## Troubleshooting

- `403 GraphAccessToTranscriptsDisabled`: step 4 was not completed.
- `403 SpeakerAttributionNotAllowed`: speaker attribution is off; the import
  still succeeds without speaker names.
- `403` on `onlineMeetings` without an inner code: the application access
  policy from step 3 is missing or not granted to the organizer.
- Empty lists for an organizer who definitely had transcribed meetings: the
  meetings have expired or the transcripts passed the expiration policy.

See the [troubleshooting guide](https://docs.twenty.com/developers/extend/apps/getting-started/troubleshooting) or ask on [Discord](https://discord.gg/cx5n4Jzs57).
