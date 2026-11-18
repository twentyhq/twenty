# Meet setup

The server admin does this once per Twenty server, in one Google Cloud project.
Workspace members then only connect their Google account.

URLs below start with `<server-url>`: the `SERVER_URL` of your Twenty server,
which can differ from the address members open Twenty at.

## Google Cloud project

1. Create or pick a Google Cloud project with billing enabled. If your server
   already uses a Google project to sign in with Google or to sync Gmail and
   Calendar, use that one: Google verifies a project, not each client, so a
   verified project only needs the new scopes reviewed.

   ```bash
   gcloud config set project <project-id>
   ```

2. Enable the Google Meet REST API, the Google Workspace Events API, the
   Google Docs API, the Google Drive API and the Cloud Pub/Sub API:

   ```bash
   gcloud services enable meet.googleapis.com workspaceevents.googleapis.com docs.googleapis.com drive.googleapis.com pubsub.googleapis.com
   ```

## OAuth consent screen and client

In the Google Cloud console, open **Google Auth Platform**.

1. **Branding**: set the app name, a support email and your authorized domain.

2. **Audience**: choose who can connect.

   - **Internal**: only accounts of the Google Workspace organization that
     owns the project. Google does not review the app. Pick this when only
     your own organization uses Meet.
   - **External**: any Google account. While the app is in **Testing**, only
     the test users listed on this page can connect, and Google ends their
     connection after 7 days: their calls stop being imported until they
     connect again. Click **Publish app** to move it to **In production**.

3. **Data access**: click **Add or remove scopes** and paste these under
   **Manually add scopes**:

   | Scope                                                     | Purpose                                                     |
   | --------------------------------------------------------- | ----------------------------------------------------------- |
   | `openid`, `email`                                         | Identify the connected Google account                       |
   | `https://www.googleapis.com/auth/meetings.space.readonly` | Read conferences and transcripts, and subscribe to events   |
   | `https://www.googleapis.com/auth/documents.readonly`      | Read the call's name and Gemini notes from Meet's documents |
   | `https://www.googleapis.com/auth/drive.meet.readonly`     | Download the video of Meet recordings from Google Drive     |

4. **Clients**: create an OAuth client of type **Web application** with this
   redirect URI:

   ```text
   <server-url>/auth/apps/callback
   ```

   In Twenty, open **Settings > Admin Panel > Apps > Meet**, and set
   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in its **Config** tab.

### Google verification

An External app in production shows members a "Google hasn't verified this
app" warning, and at most 100 accounts can connect, until Google verifies it.
Submit the app from **Verification center**:

- The Meet and Docs scopes are sensitive: Google asks why each scope is needed
  and for a short video showing it in use. The Branding page also needs a
  homepage and a privacy policy link.
- The Drive scope is restricted: on top of that, the app needs a security
  assessment by a Google-approved assessor, renewed every year.

Internal apps skip verification.

## Pub/Sub topic

Google publishes a message to this topic each time a transcript, Gemini notes
or a recording is ready.

1. Create the topic in the same project as the OAuth client:

   ```bash
   gcloud pubsub topics create twenty-google-meet
   ```

2. Let Google Meet publish to it:

   ```bash
   gcloud pubsub topics add-iam-policy-binding twenty-google-meet \
     --member='serviceAccount:meet-api-event-push@system.gserviceaccount.com' \
     --role='roles/pubsub.publisher'
   ```

3. Set `GOOGLE_MEET_PUBSUB_TOPIC` in Twenty to the full topic name:

   ```text
   projects/<project-id>/topics/twenty-google-meet
   ```

## Push subscription

Pub/Sub forwards each message to Twenty and signs the request, and Twenty
refuses any request that is not signed for the audience and service account
configured below.

1. Create a service account for the push subscription to authenticate with:

   ```bash
   gcloud iam service-accounts create twenty-google-meet-push
   ```

   The Pub/Sub service agent
   (`service-<project-number>@gcp-sa-pubsub.iam.gserviceaccount.com`) needs the
   `roles/iam.serviceAccountTokenCreator` role on it, and whoever creates the
   subscription needs `roles/iam.serviceAccountUser` on it.

2. Create the push subscription. The endpoint is the Meet server route
   of your Twenty server:

   ```bash
   gcloud pubsub subscriptions create twenty-google-meet-push \
     --topic=twenty-google-meet \
     --push-endpoint='<server-url>/webhooks/server/<application-registration-id>/99d08b46-5857-4d4c-bf6a-62ccf90305cd' \
     --push-auth-service-account='twenty-google-meet-push@<project-id>.iam.gserviceaccount.com' \
     --push-auth-token-audience='<audience>'
   ```

   `<application-registration-id>` is the last part of the URL of the Meet
   page in **Settings > Admin Panel > Apps**. `<audience>` is any fixed value
   you choose, for instance `twenty-google-meet`.

3. Set these in the same **Config** tab:

   | Variable                                   | Value                                                          |
   | ------------------------------------------ | -------------------------------------------------------------- |
   | `GOOGLE_MEET_PUBSUB_AUDIENCE`              | The audience given to the push subscription                    |
   | `GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL` | `twenty-google-meet-push@<project-id>.iam.gserviceaccount.com` |

The server route only runs once the application is claimed and installed on
its owner workspace. The **General** tab of the Meet page lists any step or
variable still missing.

## Check that it works

1. A request without Google's signature is refused:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' -X POST '<server-url>/webhooks/server/<application-registration-id>/99d08b46-5857-4d4c-bf6a-62ccf90305cd'
   ```

   `401` means the route is live and checks signatures.

2. After a member's call ends, open **Pub/Sub > Subscriptions >
   twenty-google-meet-push > Metrics** in the Google Cloud console. Successful
   push requests mean Twenty received Google's events. Failed ones usually mean
   the audience or service account set in Twenty does not match the
   subscription.

## What happens next

- A member connects their Google account from the app's settings. Twenty
  subscribes to that account's Meet events.
- When a transcript, Gemini notes or a recording is ready, Google publishes an
  event, Pub/Sub pushes it to Twenty, and the call is imported as a Call
  Recording in the member's workspace, with the notes as its summary and the
  recording as its video.
- When a call has a transcript but no Gemini notes, an AI agent writes its
  summary instead. This uses AI credits; each member can turn off AI
  summaries for their own calls in Settings, under Apps preferences.
- Once a day, Twenty renews each subscription (Google expires them after 7
  days) and imports the calls of the last two days whose event was missed.
- When a member removes their connection, the subscription is deleted.

## Limits

- Only calls the member organized are imported, and only when transcription,
  Gemini notes or recording was on. Google keeps conference data for 30 days.
- A call keeps the video of its first recording, up to 500 MB.
- A Google account delivers events to one workspace per Twenty server. A second
  workspace connecting the same account only gets the daily import.
