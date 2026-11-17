# Meet setup

The server admin does this once per Twenty server, in one Google Cloud project.
Workspace members then only connect their Google account.

## Google Cloud project

1. Create or pick a Google Cloud project with billing enabled.
2. Enable the Google Meet REST API, the Google Workspace Events API, the
   Google Docs API and the Cloud Pub/Sub API:

   ```bash
   gcloud services enable meet.googleapis.com workspaceevents.googleapis.com docs.googleapis.com pubsub.googleapis.com
   ```

3. Configure the OAuth consent screen with these scopes:

   | Scope                                                     | Purpose                                                     |
   | --------------------------------------------------------- | ----------------------------------------------------------- |
   | `openid`, `email`                                         | Identify the connected Google account                       |
   | `https://www.googleapis.com/auth/meetings.space.readonly` | Read conferences and transcripts, and subscribe to events   |
   | `https://www.googleapis.com/auth/documents.readonly`      | Read the call's name and Gemini notes from Meet's documents |

   The Meet and Docs scopes are sensitive: an app used outside your own Google
   Workspace organization needs Google's verification before members can
   connect.

4. Create an OAuth client of type **Web application** with this redirect URI:

   ```text
   https://<your-twenty-host>/auth/apps/callback
   ```

   Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on the Meet
   application registration in Twenty.

## Pub/Sub topic

Google publishes a message to this topic each time a transcript or Gemini notes
are ready.

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
     --push-endpoint='https://<your-twenty-host>/webhooks/server/<application-registration-id>/99d08b46-5857-4d4c-bf6a-62ccf90305cd' \
     --push-auth-service-account='twenty-google-meet-push@<project-id>.iam.gserviceaccount.com' \
     --push-auth-token-audience='<audience>'
   ```

   `<application-registration-id>` is the id of the Meet application
   registration in Twenty. `<audience>` is any value you choose, for instance
   the endpoint URL.

3. Set these on the application registration in Twenty:

   | Variable                                   | Value                                                          |
   | ------------------------------------------ | -------------------------------------------------------------- |
   | `GOOGLE_MEET_PUBSUB_AUDIENCE`              | The audience given to the push subscription                    |
   | `GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL` | `twenty-google-meet-push@<project-id>.iam.gserviceaccount.com` |

The server route only runs once the application is claimed and installed on
its owner workspace.

## What happens next

- A member connects their Google account from the app's settings. Twenty
  subscribes to that account's Meet events.
- When a transcript or Gemini notes are ready, Google publishes an event,
  Pub/Sub pushes it to Twenty, and the call is imported as a Call Recording in
  the member's workspace, with the notes as its summary.
- When a call has a transcript but no Gemini notes, an AI agent writes its
  summary instead. This uses AI credits; each member can turn off AI
  summaries for their own calls in Settings, under Apps preferences.
- Once a day, Twenty renews each subscription (Google expires them after 7
  days) and imports the calls of the last two days whose event was missed.
- When a member removes their connection, the subscription is deleted.

## Limits

- Only calls the member organized are imported, and only when transcription
  or Gemini notes were on. Google keeps conference data for 30 days.
- A Google account delivers events to one workspace per Twenty server. A second
  workspace connecting the same account only gets the daily import.
